import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import { SizePicker } from '../../../src/pickers';

function InputNumberDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Precision', name: 'precision', extra: 'Number of decimal places to keep', render: <InputNumber /> },
    { title: 'Max value', name: 'max', render: <InputNumber /> },
    { title: 'Min value', name: 'min', render: <InputNumber /> },
    {
      title: 'Step',
      name: 'step',
      render: <InputNumber />,
      extra: 'Step size for each change; may be a decimal',
    },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    {
      title: 'Stepper buttons',
      name: 'controls',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'String mode',
      name: 'stringMode',
      render: <Switch />,
      extra: (
        <div>Char-value mode; when enabled, high-precision decimals are supported. Also onChange will return string Type</div>
      ),
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(InputNumberDesigner);
