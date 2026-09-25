import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvanceUpload, RadioList } from 'lowcode-blocks';
import { Switch } from 'lowcode-kit';
import ComponentPicker from '../../../src/component-picker';

const SIZE = [
  { label: 'Normal', value: 'default' },
  { label: 'Mini', value: 'small' },
];

function StepsDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Title',
      name: 'title',
    },
    {
      title: 'Subtitle',
      name: 'metaTitle',
    },
    {
      title: 'Description',
      name: 'description',
    },
    {
      title: 'DisplayBorder',
      name: 'bordered',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'Hoverable',
      name: 'hoverable',
      extra: 'Floats up on hover',
      render: <Switch />,
    },
    {
      title: 'Card cover',
      name: 'cover',
      render: <AdvanceUpload type="drag" />,
    },
    {
      title: 'Size',
      name: 'size',
      initialValue: 'default',
      render: <RadioList optionType="button" buttonStyle="solid" options={SIZE} />,
    },
    {
      title: 'Card content',
      name: 'child',
      extra: 'Displayed as child components',
      render2: <ComponentPicker />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(StepsDesigner);
