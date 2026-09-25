import React from 'react';
import { Code, Pill, type PillTone } from 'lowcode-kit';

/** Publication status shared by apps and pages: 0 = draft, 1 = live, 2 = offline. */
const STATUS: Record<number, { label: string; tone: PillTone }> = {
  0: { label: 'Draft', tone: 'neutral' },
  1: { label: 'Live', tone: 'success' },
  2: { label: 'Offline', tone: 'danger' },
};

export function StatusPill({ status }: { status?: number }) {
  const meta = STATUS[status as number] || { label: 'Unknown', tone: 'neutral' as PillTone };
  return <Pill tone={meta.tone} dot>{meta.label}</Pill>;
}

/** Monospace identifier chip (codes, keys, paths). */
export const CodeChip = Code;
