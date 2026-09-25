import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';

function ColorPickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Default value',
      name: 'initialValue',
      render: <Input />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ColorPickerDesigner);
