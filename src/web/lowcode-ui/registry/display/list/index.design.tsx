import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, type AbstractRules, RadioList } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';
import InputNumber from '../../input/input-number';
import ComponentPicker from '../../../src/component-picker';
import type { AutoCompletion } from '../../../src/code-editor';

const responseDemo = {
  count: 0,
  models: [],
};

const contextParams: AutoCompletion[] = [
  { value: 'options.pageSize', meta: 'Page size', full: true },
  { value: 'options.pageNo', meta: 'Current page value', full: true },
];

const ITEM_LAYOUT = [
  { label: 'Horizontal', value: '' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Infinite scroll', value: 'infinite' },
];

function ListDesigner() {
  const rules: AbstractRules = {
    itemKey: [{ required: true, message: 'Primary key must be specified' }],
  };

  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Title', name: 'header', render: <Input /> },
    { title: 'Primary key', name: 'itemKey', render: <Input />, extra: 'Property name used for the component key' },
    {
      title: 'Layout mode',
      name: 'itemLayout',
      initialValue: '',
      render: <RadioList optionType="button" buttonStyle="solid" options={ITEM_LAYOUT} />,
    },
    {
      title: 'Container height',
      name: 'height',
      initialValue: 300,
      render: <InputNumber min={50} />,
      visible: (model) => model.itemLayout == 'infinite',
    },
    {
      title: 'Item spacing',
      name: 'gutter',
      initialValue: 16,
      render: <InputNumber min={0} />,
      visible: (model) => model.itemLayout == '',
    },
    {
      title: 'Item height',
      name: 'itemHeight',
      render: <InputNumber min={10} />,
      visible: (model) => model.itemLayout == 'infinite',
    },
    {
      title: 'DisplayBorder',
      name: 'bordered',
      render: <Switch />,
    },
    { title: 'Divider', name: 'split', initialValue: true, render: <Switch /> },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker contextParams={contextParams} responseDemo={responseDemo} /> },
    { title: 'Child components', name: 'child', render2: <ComponentPicker parameter /> },
  ];

  return (
    <AbstractForm
      groups={groups}
      rules={rules}
    />
  );
}

export default component.design(Runtime)(ListDesigner);
