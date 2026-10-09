/**
 * @module abstract-form/InputWrap
 * @description
 *   Wraps a single form-field editor.
 */
import React from 'react';
import { Input } from 'lowcode-kit';
import type { AbstractFormItemType } from '../interface';

export interface InputWrapProps {
  item?: AbstractFormItemType;
  value?: any;
  onChange?: (value: any) => void;
  children?: React.ReactNode;
  /** Full form record, supplied for function renders that read sibling fields. */
  record?: any;
  /** Disable the control (resolved from the field's `disabled`). */
  disabled?: boolean;
}

/** Render a field's control, falling back to a plain text input. */
const InputWrap: React.FC<InputWrapProps> = ({ item, value, onChange, children, record, disabled }) => {
  const bind = disabled === undefined ? { value, onChange } : { value, onChange, disabled };
  if (children) return <>{children}</>;
  const render = item?.render;
  if (typeof render === 'function') {
    // App convention: function renders receive the full record and return a
    // control to bind — inject value/onChange so the field stays controlled.
    const node = (render as any)(record || {}, value, item);
    return React.isValidElement(node) ? React.cloneElement(node as any, bind) : <>{node}</>;
  }
  if (React.isValidElement(render)) {
    return React.cloneElement(render as any, bind);
  }
  return <Input value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} />;
};

export default InputWrap;
