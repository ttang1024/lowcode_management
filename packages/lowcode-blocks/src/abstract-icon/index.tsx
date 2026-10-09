/* eslint-disable react/prop-types */ // props are typed via TS; the rule misreads the augmented component type.
/**
 * @module abstract-icon
 * @description
 *   Resolve an icon by name (lucide names, and the legacy `…Outlined` / `…Filled`
 *   names stored by older configs — see `resolveIcon` in lowcode-kit), or
 *   render an image URL / raw node directly.
 */
import React from 'react';
import { NamedIcon, resolveIcon } from 'lowcode-kit';
import { isAbsoluteUrl } from 'lowcode-common';

export interface AbstractIconContextValue {
  /** Base URL of an iconfont stylesheet, when icons are font-based. */
  url?: string;
}

const AbstractIconContext = React.createContext<AbstractIconContextValue>({});

export interface AbstractIconProps {
  type?: string;
  icon?: React.ReactNode | string;
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  spin?: boolean;
  [key: string]: any;
}

type AbstractIconComponent = React.FC<AbstractIconProps> & {
  Context: typeof AbstractIconContext;
  Provider: React.FC<{ value?: AbstractIconContextValue; children?: React.ReactNode }>;
};

const AbstractIcon = (({ type, icon, name, className, style, spin, onClick }: AbstractIconProps) => {
  const value = icon ?? type ?? name;
  if (value && React.isValidElement(value)) return <>{value}</>;
  if (typeof value !== 'string' || !value) return null;
  if (isAbsoluteUrl(value) || value.startsWith('/') || value.startsWith('data:')) {
    return <img src={value} alt="" className={['abstract-icon inline-block size-[1em] align-[-0.125em]', className].filter(Boolean).join(' ')} style={style} onClick={onClick} />;
  }
  if (!resolveIcon(value)) return null;
  return (
    <span className={['abstract-icon inline-flex items-center align-[-0.125em]', className].filter(Boolean).join(' ')} style={style} onClick={onClick}>
      <NamedIcon name={value} spin={spin} />
    </span>
  );
}) as AbstractIconComponent;

AbstractIcon.Context = AbstractIconContext;
AbstractIcon.Provider = function AbstractIconProvider({ value = {}, children }) {
  return <AbstractIconContext.Provider value={value}>{children}</AbstractIconContext.Provider>;
};

export default AbstractIcon;
