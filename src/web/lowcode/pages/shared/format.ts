/** `2026-09-24T23:12:44.000Z` → `2026-09-25 07:12` (local time); passes through other values. */
export function formatDateTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
