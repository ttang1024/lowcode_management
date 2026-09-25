/* eslint-disable react/prop-types */ // props are typed via TS; the rule cannot read them through the augmented `React.FC<P> & {...}` type.
/**
 * @module abstract-injecter
 * @description
 *   Lightweight dependency-injection context used to share runtime services
 *   (config, dispatch helpers, ...) down the low-code component tree.
 */
import React from 'react';
import type { AbstractInjecterContextValue } from '../interface';

export type { AbstractInjecterContextValue };

export const AbstractInjecterContext = React.createContext<AbstractInjecterContextValue>({});

export function useInjecter(): AbstractInjecterContextValue {
  return React.useContext(AbstractInjecterContext);
}

/**
 * True inside the page being designed (an `AbstractActions` with `inject`).
 * The page designer's own config drawers share the injecter context but sit
 * outside that surface, so they must not grow design affordances themselves.
 */
export const DesignSurfaceContext = React.createContext(false);

export interface DesignHooks {
  /** Render slots: `appendSearchAfter()`, `appendAbstractTableInner()`, … */
  node: Record<string, ((...args: any[]) => React.ReactNode) | undefined>;
  /** Events: `onColumnDbClick(column)`, `onFieldDbClick(field, type)`, … */
  listener: Record<string, ((...args: any[]) => void) | undefined>;
}

/**
 * The designer's injected slots/listeners when rendering on the design surface
 * (or when `force` — e.g. a component's own `inject` prop — is set), else null.
 */
export function useDesignHooks(force?: boolean): DesignHooks | null {
  const onSurface = React.useContext(DesignSurfaceContext);
  const injecter = useInjecter();
  if (!(onSurface || force) || (!injecter.node && !injecter.listener)) return null;
  return { node: injecter.node || {}, listener: injecter.listener || {} };
}

export interface AbstractInjecterProps {
  value?: AbstractInjecterContextValue;
  children?: React.ReactNode;
}

const AbstractInjecter: React.FC<AbstractInjecterProps> & { Context: typeof AbstractInjecterContext } = ({ value = {}, children }) => {
  return <AbstractInjecterContext.Provider value={value}>{children}</AbstractInjecterContext.Provider>;
};

AbstractInjecter.Context = AbstractInjecterContext;

export default AbstractInjecter;
