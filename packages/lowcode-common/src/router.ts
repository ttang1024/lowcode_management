/**
 * @module router
 * @description React Router v5 → v6 compatibility shims.
 *
 *   The low-code framework threads v5-style `history` and `match` objects
 *   through component props (e.g. `AbstractActions` receives `history` / `route`
 *   and downstream code reads `history.push(...)` and `match.params`). Rather
 *   than refactor every action view, these hooks expose the small v5 surface the
 *   framework relies on, implemented on top of react-router v6's
 *   `useNavigate` / `useParams` / `useLocation`.
 */
import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export interface CompatHistory {
  push: (to: string, state?: any) => void;
  replace: (to: string, state?: any) => void;
  goBack: () => void;
  back: () => void;
  go: (delta: number) => void;
  location: ReturnType<typeof useLocation>;
}

/** v5-compatible `useHistory()` backed by v6 `useNavigate` / `useLocation`. */
export function useHistory(): CompatHistory {
  const navigate = useNavigate();
  const location = useLocation();
  return useMemo<CompatHistory>(() => ({
    push: (to: string, state?: any) => navigate(to, { state }),
    replace: (to: string, state?: any) => navigate(to, { replace: true, state }),
    goBack: () => navigate(-1),
    back: () => navigate(-1),
    go: (delta: number) => navigate(delta),
    location,
  }), [navigate, location]);
}

export interface CompatMatch<TParams = Record<string, string | undefined>> {
  params: TParams;
  url: string;
  path: string;
  isExact: boolean;
}

/** v5-compatible `useRouteMatch()` backed by v6 `useParams` / `useLocation`. */
export function useRouteMatch<TParams = Record<string, string | undefined>>(): CompatMatch<TParams> {
  const params = useParams();
  const location = useLocation();
  return useMemo<CompatMatch<TParams>>(() => ({
    params: params as TParams,
    url: location.pathname,
    path: location.pathname,
    isExact: true,
  }), [params, location.pathname]);
}
