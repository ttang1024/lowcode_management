import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { InputNumber, Switch } from 'lowcode-kit';

function SliderDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'Supports clearing; effective in single-select mode',
      render: <Switch />,
    },
    {
      title: 'Tick restriction',
      name: 'dots',
      extra: 'Whether dragging is restricted to ticks',
      render: <Switch />,
    },
    { title: 'Dual-slider mode', name: 'range', render: <Switch /> },
    { title: 'Reversed axis', name: 'reverse', render: <Switch /> },
    { title: 'Max value', name: 'max', render: <InputNumber /> },
    { title: 'Min value', name: 'min', render: <InputNumber /> },
    {
      title: 'Step',
      name: 'step',
      render: <InputNumber />,
      extra: 'Step; must be greater than 0 and divisible by (max - min). When marks is a non-empty object, step can be set to null, in which case the Slider selectable values are only those marked by marks',
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(SliderDesigner);
