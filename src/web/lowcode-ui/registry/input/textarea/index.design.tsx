import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';

function TextAreaDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Max length', name: 'maxLength', render: <InputNumber /> },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      render: <Switch />,
    },
    {
      title: 'Rows',
      name: 'rows',
      initialValue: 3,
      render: <InputNumber />,
    },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Displayed character count', name: 'showCount', render: <Switch /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TextAreaDesigner);
