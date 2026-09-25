import { AbstractIcon, IconPicker } from 'lowcode-blocks';
import React, { useContext } from 'react';

export interface AppIconPickerProps {
  value?: string
  onChange?: (value: string) => void
}

export default function AppIconPicker(props:AppIconPickerProps) {
  const context = useContext(AbstractIcon.Context);

  return (
    <IconPicker
      mode="full"
      value={props.value}
      url={context.url}
      allowClear
      onChange={props.onChange}
    />
  );
}