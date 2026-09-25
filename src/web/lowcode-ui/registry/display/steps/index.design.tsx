import React from 'react';
import Runtime, { type RuntimeProps, type StepItemOption } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput, RadioList } from 'lowcode-blocks';
import { Input, InputNumber } from 'lowcode-kit';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import AppIconPicker from '../../../src/app-icon-picker';

const DIRECTIONS = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' },
];

const SIZE = [
  { label: 'Normal', value: 'default' },
  { label: 'Mini', value: 'small' },
];

const TYPE = [
  { label: 'Default', value: 'default' },
  { label: 'Navigation', value: 'navigation' },
];

function StepsDesigner() {
  const columns: AbstractEColumns<StepItemOption> = [
    { title: 'Title', width: 150, name: 'title', editor: () => <Input /> },
    { title: 'Icon', name: 'icon', editor: () => <AppIconPicker /> },
  ];

  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Direction',
      name: 'direction',
      render: <RadioList optionType="button" buttonStyle="solid" options={DIRECTIONS} />,
    },
    {
      title: 'Tag position',
      name: 'labelPlacement',
      visible: (model) => model.direction == 'horizontal',
      render: <RadioList optionType="button" buttonStyle="solid" options={DIRECTIONS} />,
    },
    {
      title: 'Size',
      name: 'size',
      initialValue: 'default',
      render: <RadioList optionType="button" buttonStyle="solid" options={SIZE} />,
    },
    {
      title: 'Type',
      name: 'type',
      initialValue: 'default',
      render: <RadioList optionType="button" buttonStyle="solid" options={TYPE} />,
    },
    {
      title: 'Start number',
      name: 'initial',
      initialValue: 0,
      render: <InputNumber />,
    },
    {
      title: '',
      name: 'items',
      render: <AbstractTableInput operation={{ width: 60 }} columns={columns} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(StepsDesigner);
