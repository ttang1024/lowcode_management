/**
 * @module sync-table-view/normalize
 * @description Shared helper for cross-environment sync views: strips the
 *   server-managed metadata fields (`id`, `createdAt`, `env`, `updatedAt`) from
 *   a record and serialises the remainder for side-by-side diffing.
 */
export function normalizeSyncModel(model: Record<string, any>): string {
  const { id, createdAt, env, updatedAt, ...data } = model || {};
  return JSON.stringify(data, null, 2);
}
