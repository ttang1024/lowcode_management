import React from 'react';
import { component } from 'lowcode-registry';
import ColorPicker, { type ColorPickerProps } from '../../../src/color-picker';

export interface RuntimeProps extends ColorPickerProps {
}

export function ColorPickerRuntime(props: RuntimeProps) {
  return (
    <ColorPicker
      {...props}
    />
  );
}

export default component.runtime('color-picker', { type: 'input', valueType: 'string' })(
  ColorPickerRuntime,
);
