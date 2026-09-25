/**
 * @module decorators
 * @description
 *   Route and parameter decorators. Each one stores plain metadata on the
 *   controller class; {@link readController} turns it back into a route table
 *   when the server starts.
 */
import 'reflect-metadata';

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Where a handler argument comes from. */
export type ParamSource =
  | { from: 'body' }
  | { from: 'param', name: string }
  | { from: 'file', name: string };

interface RouteMeta {
  verb: HttpVerb;
  path: string;
  handler: string;
}

export interface ControllerRoute extends RouteMeta {
  /** One entry per declared parameter; `undefined` for undecorated ones. */
  params: (ParamSource | undefined)[];
  /** Declared parameter types (from `emitDecoratorMetadata`), used for coercion. */
  types: any[];
}

export interface ControllerDefinition {
  prefix: string;
  routes: ControllerRoute[];
}

const PREFIX = Symbol('lowcode-server:prefix');
const ROUTES = Symbol('lowcode-server:routes');
const PARAMS = Symbol('lowcode-server:params');

/** Marks a class as a controller whose routes live under `prefix`. */
export function Controller(prefix = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(PREFIX, prefix, target);
  };
}

function route(verb: HttpVerb) {
  return (path = ''): MethodDecorator => (proto, handler) => {
    const ctor = proto.constructor;
    const routes: RouteMeta[] = Reflect.getOwnMetadata(ROUTES, ctor) || [];
    Reflect.defineMetadata(ROUTES, [...routes, { verb, path, handler: String(handler) }], ctor);
  };
}

export const Get = route('GET');
export const Post = route('POST');
export const Put = route('PUT');
export const Delete = route('DELETE');

function param(source: ParamSource): ParameterDecorator {
  return (proto, handler, index) => {
    const ctor = proto.constructor;
    const all: Record<string, ParamSource[]> = Reflect.getOwnMetadata(PARAMS, ctor) || {};
    const list = [...(all[String(handler)] || [])];
    list[index] = source;
    Reflect.defineMetadata(PARAMS, { ...all, [String(handler)]: list }, ctor);
  };
}

/** Binds the parsed request body, built into the declared type when it is a model. */
export const Body: ParameterDecorator = param({ from: 'body' });

/** Binds a single value by name, looked up in the query string first, then the body. */
export function Param(name: string): ParameterDecorator {
  return param({ from: 'param', name });
}

/** Binds an uploaded multipart file by form field name. */
export function File(name: string): ParameterDecorator {
  return param({ from: 'file', name });
}

function joinPath(...parts: string[]): string {
  const joined = ('/' + parts.join('/')).replace(/\/{2,}/g, '/');
  return joined.length > 1 ? joined.replace(/\/$/, '') : joined;
}

/** Reads the metadata recorded by the decorators above, or `null` for a non-controller. */
export function readController(ctor: any): ControllerDefinition | null {
  const prefix: string | undefined = Reflect.getOwnMetadata(PREFIX, ctor);
  if (prefix === undefined) return null;
  const routes: RouteMeta[] = Reflect.getOwnMetadata(ROUTES, ctor) || [];
  const params: Record<string, ParamSource[]> = Reflect.getOwnMetadata(PARAMS, ctor) || {};
  return {
    prefix,
    routes: routes.map((r) => ({
      ...r,
      path: joinPath(prefix, r.path),
      params: params[r.handler] || [],
      types: Reflect.getMetadata('design:paramtypes', ctor.prototype, r.handler) || [],
    })),
  };
}
