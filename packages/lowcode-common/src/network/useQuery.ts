/**
 * @module network/useQuery
 * @description
 *   React data-fetching helper used as `someService.useQuery(deps).method(args)`.
 *   The returned {@link HooksResponse} exposes the resolved payload, loading
 *   status and a `refresh()` callback.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HooksResponse<T = any> {
  data?: T;
  status: QueryStatus;
  loading: boolean;
  error?: any;
  refresh: () => void;
  update: (data: T) => void;
}

/** Run an async fetcher inside React state, re-running when `deps` change. */
function useQueryHook<T = any>(fetcher: () => Promise<T> | T, deps: any[] = []): HooksResponse<T> {
  const [state, setState] = useState<{ data?: T; status: QueryStatus; error?: any }>({ status: 'loading' });

  // Only the latest request may write state, so a slow earlier response
  // (e.g. after deps changed) cannot overwrite newer data.
  const latest = useRef(0);

  const run = useCallback(() => {
    const id = ++latest.current;
    setState((prev) => ({ ...prev, status: 'loading' }));
    Promise.resolve()
      .then(fetcher)
      .then(
        (data) => id === latest.current && setState({ data, status: 'success', error: undefined }),
        (error) => id === latest.current && setState({ data: undefined, status: 'error', error }),
      );
  }, deps);

  const update = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  useEffect(() => {
    run();
    return () => {
      latest.current++;
    };
  }, deps);

  return { ...state, loading: state.status === 'loading', refresh: run, update };
}

/**
 * Build a proxy whose method calls execute the matching method on `instance`
 * inside {@link useQueryHook}. Powers `Service.useQuery()`.
 */
export function createQueryProxy(instance: any, deps: any[] = []): any {
  return new Proxy(
    {},
    {
      get(_target, method: string) {
        return (...args: any[]) => useQueryHook(() => instance[method](...args), deps);
      },
    },
  );
}
