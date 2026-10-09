/**
 * @module network
 * @description
 *   Browser HTTP client mirroring the private `lowcode-common` Network/Service API.
 *   Requests are built lazily through a chainable, awaitable {@link RequestBuilder}
 *   (`network.post(url, data).try(...).json().silent()`), and global behaviour is
 *   configured through `Network.config({...}).on('response', ...)`.
 */

import { createQueryProxy, type HooksResponse } from './useQuery';
import { isAbsoluteUrl, joinUrl } from '../url';

export type NetworkEvent = 'sign' | 'error' | 'response' | 'request';

/**
 * Maps a service to its `useQuery()` view: every method's result (`Promise<T>`
 * or plain `T`) is re-typed as the {@link HooksResponse} wrapper the proxy
 * produces at runtime. Non-method members are passed through unchanged.
 */
export type Queryfied<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => HooksResponse<Awaited<R>>
    : T[K];
};

export interface NetworkConfig {
  base?: string;
  contentType?: string;
  credentials?: RequestCredentials;
  loading?: (text?: string) => (() => void) | void;
  [key: string]: any;
}

export interface RequestContext {
  url: string;
  method: string;
  responseConvert: 'json' | 'text' | 'blob';
  extra?: any;
  config: NetworkConfig;
}

/** Business error carrying the offending response payload. */
export class BizError extends Error {
  code: string | number;
  data?: any;

  constructor(code: string | number, message?: string, data?: any) {
    super(message || String(code));
    this.name = 'BizError';
    this.code = code;
    this.data = data;
  }
}

type Handler = (...args: any[]) => any;

/**
 * A `response` handler may return this to have the request sent again, e.g.
 * once the user has signed back in after their session expired. A request is
 * retried at most {@link MAX_RESENDS} times this way.
 */
export const RESEND = Symbol('network:resend');
const MAX_RESENDS = 2;

function buildQuery(data: any): string {
  if (!data) return '';
  const params = Object.keys(data)
    .filter((k) => data[k] !== undefined && data[k] !== null)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`);
  return params.length ? '?' + params.join('&') : '';
}

function resolveUrl(base: string | undefined, url: string): string {
  if (isAbsoluteUrl(url) || !base) return url;
  return joinUrl(base, url);
}

/** Lazily-executed, chainable, awaitable request. */
export class RequestBuilder<T = any> implements PromiseLike<T> {
  private convert: 'json' | 'text' | 'blob' = 'json';
  private isSilent = false;
  private retry?: { max: number; predicate: (r: any) => boolean; delay: number };
  private loadingText?: string;
  private extraData?: any;
  private contentType?: string;
  private credentialsOverride?: RequestCredentials;
  private hasCredentialsOverride = false;
  private controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  private promise?: Promise<T>;

  constructor(
    private network: Network,
    private url: string,
    private data: any,
    private method: string,
    private headers?: Record<string, string> | Array<{ label: string; value: string }>,
  ) {}

  json(): this {
    this.convert = 'json';
    return this;
  }

  text(): this {
    this.convert = 'text';
    return this;
  }

  blob(): this {
    this.convert = 'blob';
    return this;
  }

  silent(silent = true): this {
    this.isSilent = silent;
    return this;
  }

  try(max: number, predicate: (r: any) => boolean, delay = 0): this {
    this.retry = { max, predicate, delay };
    return this;
  }

  loading(text = ''): this {
    this.loadingText = text;
    return this;
  }

  /** Alias of {@link loading} — show a loading indicator while the request runs. */
  showLoading(text = ''): this {
    return this.loading(text);
  }

  extra(extra: any): this {
    this.extraData = extra;
    return this;
  }

  /** Alias of {@link extra} — attach request-scoped metadata read by handlers. */
  setExtra(extra: any): this {
    return this.extra(extra);
  }

  /** Override the request Content-Type for this call (e.g. form-encoded uploads). */
  with(contentType: string): this {
    this.contentType = contentType;
    return this;
  }

  /** Override fetch credentials for this call (e.g. `undefined` to omit cookies). */
  credentials(value?: RequestCredentials): this {
    this.credentialsOverride = value;
    this.hasCredentialsOverride = true;
    return this;
  }

  cancel(): void {
    this.controller?.abort();
  }

  private async execute(): Promise<T> {
    const config = this.network.getConfig();
    const context: RequestContext = {
      url: this.url,
      method: this.method,
      responseConvert: this.convert,
      extra: this.extraData,
      config,
    };

    // The indicator is opt-in per request via `.loading()` / `.showLoading()`.
    const wantsLoading = this.loadingText !== undefined && !this.isSilent;
    const dismiss = wantsLoading && config.loading ? config.loading(this.loadingText) : undefined;

    const run = async(): Promise<T | typeof RESEND> => {
      const isGet = /GET|HEAD/i.test(this.method);
      const url = resolveUrl(config.base, this.url) + (isGet ? buildQuery(this.data) : '');
      const headers: Record<string, string> = Array.isArray(this.headers) ?
        Object.fromEntries(this.headers.map((h) => [h.label, h.value])) :
        { ...this.headers };
      if (!isGet) headers['Content-Type'] = this.contentType || config.contentType || 'application/json';

      const request: any = { url, method: this.method, headers, data: this.data, context };
      for (const sign of this.network.getHandlers('sign')) {
        await sign(request, context);
      }
      for (const onRequest of this.network.getHandlers('request')) {
        await onRequest(request, context);
      }

      const init: RequestInit = {
        method: this.method,
        headers: request.headers,
        credentials: this.hasCredentialsOverride ? this.credentialsOverride : (config.credentials || 'include'),
        signal: this.controller?.signal,
      };
      if (!isGet && this.data !== undefined) {
        init.body = headers['Content-Type'].indexOf('json') > -1 ? JSON.stringify(this.data) : this.data;
      }

      const response = await fetch(request.url, init);
      let payload: any;
      if (this.convert === 'json') payload = await response.json().catch(() => null);
      else if (this.convert === 'blob') payload = await response.blob();
      else payload = await response.text();

      // Allow registered response handlers to transform / reject the payload.
      for (const onResponse of this.network.getHandlers('response')) {
        payload = await onResponse(payload, context);
        if (payload === RESEND) return RESEND;
      }
      // An HTTP error the handlers did not already turn into a rejection.
      if (!response.ok) {
        const message = (payload && typeof payload === 'object' && (payload.errorMsg || payload.message)) ||
          `${response.status} ${response.statusText}`.trim();
        throw new BizError(response.status, message, payload);
      }
      return payload as T;
    };

    const send = async(): Promise<T> => {
      for (let resends = 0; ; resends++) {
        const result = await run();
        if (result !== RESEND) return result as T;
        if (resends >= MAX_RESENDS) throw new BizError(401, 'Request was not accepted after signing in again');
      }
    };

    try {
      let result = await send();
      if (this.retry) {
        let attempts = this.retry.max;
        while (attempts > 0 && this.retry.predicate(result)) {
          if (this.retry.delay) await new Promise((r) => setTimeout(r, this.retry!.delay));
          result = await send();
          attempts--;
        }
      }
      return result;
    } catch (error: any) {
      if (!this.isSilent) {
        const bizError = error instanceof BizError ? error : new BizError(error?.code || 99, error?.message, error);
        for (const onError of this.network.getHandlers('error')) {
          onError(bizError, context);
        }
      }
      throw error;
    } finally {
      (dismiss as (() => void) | undefined)?.();
    }
  }

  then<R1 = T, R2 = never>(
    onfulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    if (!this.promise) this.promise = this.execute();
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<R = never>(onrejected?: ((reason: any) => R | PromiseLike<R>) | null): Promise<T | R> {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this.then().finally(onfinally as any);
  }

  // Present so a RequestBuilder is structurally assignable to `Promise<T>`
  // (it already implements then/catch/finally); lets services keep their
  // `Promise<T>` return annotations while returning the awaitable builder.
  get [Symbol.toStringTag](): string {
    return 'RequestBuilder';
  }
}

/**
 * Base HTTP client. A global configuration is shared across all instances
 * (set via {@link Network.config}); each instance may override fields such as
 * `base` through its constructor.
 */
export class Network {
  private static globalConfig: NetworkConfig = { contentType: 'application/json' };
  private static handlers: Record<string, Handler[]> = { sign: [], error: [], response: [], request: [] };

  private instanceConfig: NetworkConfig;

  constructor(config: NetworkConfig = {}) {
    this.instanceConfig = config;
  }

  /** Merge global configuration. Returns the class for `.on(...)` chaining. */
  static config(config: NetworkConfig): typeof Network {
    Network.globalConfig = { ...Network.globalConfig, ...config };
    return Network;
  }

  /** Register a handler for a lifecycle event. Chainable. */
  static on(event: NetworkEvent, handler: Handler): typeof Network {
    (Network.handlers[event] = Network.handlers[event] || []).push(handler);
    return Network;
  }

  getConfig(): NetworkConfig {
    return { ...Network.globalConfig, ...this.instanceConfig };
  }

  getHandlers(event: NetworkEvent): Handler[] {
    return Network.handlers[event] || [];
  }

  /** Issue a request with an explicit verb. */
  any<T = any>(
    url: string,
    data?: any,
    method = 'POST',
    headers?: Record<string, string> | Array<{ label: string; value: string }>,
  ): RequestBuilder<T> {
    return new RequestBuilder<T>(this, url, data, method, headers);
  }

  get<T = any>(url: string, data?: any): RequestBuilder<T> {
    return new RequestBuilder<T>(this, url, data, 'GET');
  }

  post<T = any>(url: string, data?: any): RequestBuilder<T> {
    return new RequestBuilder<T>(this, url, data, 'POST');
  }

  put<T = any>(url: string, data?: any): RequestBuilder<T> {
    return new RequestBuilder<T>(this, url, data, 'PUT');
  }

  delete<T = any>(url: string, data?: any): RequestBuilder<T> {
    return new RequestBuilder<T>(this, url, data, 'DELETE');
  }

  /**
   * Return a proxy whose method calls run as React queries. Usage:
   * `service.useQuery(deps).someMethod(args)` -> {@link HooksResponse}.
   */
  useQuery(deps: any[] = []): Queryfied<this> {
    return createQueryProxy(this, deps) as Queryfied<this>;
  }
}

/** Service base class — a {@link Network} with no extra behaviour by default. */
export class Service extends Network {}
