import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';

const SIZE = [
  { label: 'Large', value: 'large' },
  { label: 'Center', value: 'default' },
  { label: 'Small', value: 'small' },
];

const SHAPE = [
  { label: 'Circle', value: 'circle' },
  { label: 'Square', value: 'square' },
];

function AvatarDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Avatar URL', name: 'src', render: <Input /> },
    {
      title: 'Avatar size',
      name: 'size',
      initialValue: 'default',
      render: <RadioList optionType="button" buttonStyle="solid" options={SIZE} />,
    },
    {
      title: 'Avatar shape',
      name: 'shape',
      initialValue: 'circle',
      render: <RadioList optionType="button" buttonStyle="solid" options={SHAPE} />,
    },
    { title: 'AvatarDescription', name: 'alt', extra: 'Alternative text shown when the image cannot be displayed', render: <Input /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(AvatarDesigner);
