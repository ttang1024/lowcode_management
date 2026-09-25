/**
 * @module abstract-provider
 * @description
 *   Top-level provider that wires the injecter context and a crash boundary
 *   around the low-code app tree.
 */
import React from 'react';
import AbstractInjecter, { AbstractInjecterContext } from '../abstract-injecter';
import CrashProvider from '../crash-provider';
import type { AbstractInjecterContextValue } from '../interface';

export interface AbstractProviderProps {
  value?: AbstractInjecterContextValue;
  children?: React.ReactNode;
}

type AbstractProviderComponent = React.FC<AbstractProviderProps> & {
  Context: typeof AbstractInjecterContext;
};

const AbstractProvider = (({ value, children }: AbstractProviderProps) => {
  return (
    <CrashProvider>
      <AbstractInjecter value={value}>
        {children}
      </AbstractInjecter>
    </CrashProvider>
  );
}) as AbstractProviderComponent;

// The provider injects services (e.g. `fetchOption`) via the injecter context;
// expose it here so consumers can `useContext(AbstractProvider.Context)`.
AbstractProvider.Context = AbstractInjecterContext;

export default AbstractProvider;
