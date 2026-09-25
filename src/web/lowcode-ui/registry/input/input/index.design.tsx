import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import { SizePicker } from '../../../src/pickers';

function InputDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Max length', name: 'maxLength', render: <InputNumber /> },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      render: <Switch />,
    },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Displayed character count', name: 'showCount', render: <Switch /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(InputDesigner);
