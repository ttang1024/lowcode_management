import React from 'react';

/**
 * Form-wide `disabled` flag. A `Form` with `disabled` (or a read-only overlay)
 * provides it, and every kit control falls back to it when it has no own
 * `disabled` prop.
 */
export const DisabledContext = React.createContext(false);

export function useDisabled(own?: boolean) {
  const inherited = React.useContext(DisabledContext);
  return own ?? inherited;
}

/** Control size. `middle` is the default; `default` maps to it. */
export type ControlSize = 'small' | 'middle' | 'large';

export function normalizeSize(size?: string): ControlSize {
  if (size === 'small' || size === 'large') return size;
  return 'middle';
}

/** Height + text classes for single-line controls, per size. */
export const controlHeight: Record<ControlSize, string> = {
  small: 'h-7 text-[13px]',
  middle: 'h-9 text-sm',
  large: 'h-10 text-[15px]',
};
