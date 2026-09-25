/**
 * Sync a record pushed from another environment: update the local copy when
 * one already exists, otherwise create it (dropping the foreign `id`).
 */
export function syncRecord<T extends { id?: number }, R>(
  existing: unknown,
  data: T,
  update: (data: T) => R,
  add: (data: T) => R,
): R {
  if (existing) {
    return update(data);
  }
  delete data.id;
  return add(data);
}
