import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, Switch, InputNumber } from 'lowcode-kit';
import { SizePicker } from '../../../src/pickers';

function TimePickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      initialValue: true,
      render: <Switch />,
    },
    { title: 'Expanded mode', name: 'open', render: <Switch />, normalize: (v) => v == true ? true : undefined },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    { title: 'Hour step', name: 'hourStep', initialValue: 1, render: <InputNumber max={24} min={1}/> },
    { title: 'Minute step', name: 'minuteStep', initialValue: 1, render: <InputNumber max={60} min={1}/> },
    { title: 'Second step', name: 'secondStep', initialValue: 1, render: <InputNumber max={60} min={1}/> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TimePickerDesigner);
