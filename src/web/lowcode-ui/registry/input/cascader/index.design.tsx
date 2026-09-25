import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import SelectApi from '../../../src/select-api';
import AppIconPicker from '../../../src/app-icon-picker';
import { SizePicker } from '../../../src/pickers';

const apiResponse = { result: [] };

function CascaderDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Display field', name: 'labelName', render: <Input /> },
    { title: 'Value field', name: 'valueName', render: <Input /> },
    { title: 'Max level', name: 'maxLevel', render: <InputNumber min={1} max={6} /> },
    { title: 'Data source', name: 'api', render: <SelectApi contextParams={['label', 'value']} responseDemo={apiResponse} /> },
    { title: 'DescriptionText', name: 'placeholder' },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      initialValue: true,
      render: <Switch />,
    },
    { title: 'Show search', name: 'showSearch', render: <Switch /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    {
      title: 'Max tags',
      name: 'maxTagCount',
      extra: 'Maximum number of tags to display; responsive mode has a performance cost. 0 means responsive mode',
      normalize: (v) => v > 0 ? v : '',
      render: <InputNumber min={0} />,
    },
    {
      title: 'Suffix icon',
      name: 'suffixIcon',
      render: <AppIconPicker />,
    },
    {
      title: 'Empty-state text',
      name: 'notFoundContent',
      render: <Input.TextArea rows={3} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(CascaderDesigner);
