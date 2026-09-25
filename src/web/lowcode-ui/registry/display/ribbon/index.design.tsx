import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { ColorPicker } from 'lowcode-ui';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';

const PLACEMENT = [
  { label: 'start', value: 'start' },
  { label: 'end', value: 'end' },
];

function RibbonDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Content',
      name: 'text',
      render: <Input />,
    },
    {
      title: 'Ribbon color',
      name: 'color',
      render: <ColorPicker />,
    },
    {
      title: 'Ribbon position',
      name: 'placement',
      initialValue: 'end',
      render: <RadioList buttonStyle="solid" optionType="button" options={PLACEMENT} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(RibbonDesigner);
