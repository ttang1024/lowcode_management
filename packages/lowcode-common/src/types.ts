/**
 * @module types
 * @description Loose helper types for rematch models (kept permissive — the app
 *   compiles with `noImplicitAny: false`).
 */

/** `this` type inside a rematch effect (state + dispatch helpers). */
export type RematchEffectThis<M = any> = {
  [key: string]: any;
} & ThisType<M>;

/** Map a rematch model definition to its connected props shape. */
export type RematchModelTo<M = any> = {
  [key: string]: any;
} & Partial<M>;
