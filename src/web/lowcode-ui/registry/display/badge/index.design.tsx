import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { ColorPicker } from 'lowcode-ui';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input, Switch, InputNumber } from 'lowcode-kit';

const SIZE = [
  { label: 'default', value: 'default' },
  { label: 'small', value: 'small' },
];

function BadgeDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Show red dot',
      name: 'dot',
      extra: 'No number, just a red dot',
      render: <Switch />,
    },
    {
      title: 'Color',
      name: 'color',
      render: <ColorPicker />,
    },
    {
      title: 'Displayed number',
      name: 'count',
      render: <Input />,
    },
    {
      title: 'Cap value',
      name: 'overflowCount',
      initialValue: 99,
      render: <InputNumber />,
    },
    {
      title: 'Size',
      name: 'size',
      render: <RadioList buttonStyle="solid" optionType="button" options={SIZE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(BadgeDesigner);
