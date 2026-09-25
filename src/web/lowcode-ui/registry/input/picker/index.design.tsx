import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';
import { SizePicker } from '../../../src/pickers';
import type { AutoCompletion } from '../../../src/code-editor';

const VALUE_MODE = [
  { value: 'normal', label: 'Single value' },
  { value: 'object', label: 'object' },
  { value: 'tags-single', label: 'Tag single-select' },
];

export const SELECT_MODE = [
  { value: 'multiple', label: 'Multi-select' },
  { value: 'tags', label: 'Tag' },
  { value: '', label: 'Default' },
];

const FILTER_MODE = [
  { value: 'remote', label: 'Remote' },
  { value: 'local', label: 'Local' },
  { value: 'none', label: 'None' },
];

const responseDemo = {
  count: 0,
  models: [],
};

const contextParams: AutoCompletion[] = [
  { value: 'options.pageSize', meta: 'Page size', full: true },
  { value: 'options.pageNo', meta: 'Current page value', full: true },
  { value: 'options.filter', meta: 'Filter criteria', full: true },
];

function PickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueName', initialValue: 'value' },
    {
      title: 'Title field',
      name: 'labelName',
      initialValue: 'label',
    },
    {
      title: 'Option formatter',
      name: 'formatLabel',
      render: <Input.TextArea rows={3} />,
      extra: 'Supports template strings, e.g. {name}-{age}',
    },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker contextParams={contextParams} responseDemo={responseDemo} /> },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      render: <Switch />,
    },
    {
      title: 'Value type',
      name: 'valueMode',
      initialValue: 'normal',
      render: <RadioList optionType="button" buttonStyle="solid" options={VALUE_MODE} />,
    },
    {
      title: 'Selection mode',
      name: 'mode',
      initialValue: '',
      render: <RadioList optionType="button" buttonStyle="solid" options={SELECT_MODE} />,
    },
    {
      title: 'Search mode',
      name: 'type',
      initialValue: 'local',
      render: <RadioList optionType="button" buttonStyle="solid" options={FILTER_MODE} />,
    },
    {
      title: 'Dialog width',
      name: 'dropdownMatchSelectWidth',
      extra: '',
      render: <InputNumber />,
    },
    {
      title: 'Max tags',
      name: 'maxTagCount',
      render: <InputNumber />,
    },
    {
      title: 'Dialog height',
      name: 'listHeight',
      extra: '',
      render: <InputNumber />,
    },
    {
      title: 'Size',
      name: 'size',
      extra: '',
      render: <SizePicker />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(PickerDesigner);
