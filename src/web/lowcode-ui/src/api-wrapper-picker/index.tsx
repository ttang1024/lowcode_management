/**
 * @module ApiWrapperPicker
 * @description Data sourceChoose
 */
import { Input } from 'lowcode-kit';
import { AbstractForm, type AbstractGroups, AbstractTableInput, RadioList } from 'lowcode-blocks';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import React from 'react';
import SelectApi from '../select-api';
import SourcePicker from '../source-picker';
import type { AutoCompletion } from '../code-editor';

const TYPES = [
  { label: 'Dictionary', value: 'options' },
  { label: 'API', value: 'api' },
  { label: 'Custom', value: 'json' },
  { label: 'None', value: 'none' },
];

export interface ApiWrapperPickerProps {
  value?: ApiWrapperOptions
  responseDemo: any
  contextParams?: AutoCompletion[]
  onChange?: (value: ApiWrapperOptions) => void
}

export default function ApiWrapperPicker({ contextParams, responseDemo, ...props }: ApiWrapperPickerProps) {
  const demo = {
    result: responseDemo,
  };

  const columns:AbstractEColumns<{ label:string, value:string }> = [
    { title: 'Name', name: 'label', editor: ()=><Input /> },
    { title: 'Value', name: 'value', editor: ()=><Input /> },
  ];

  const groups: AbstractGroups<ApiWrapperOptions> = [
    {
      title: 'Data source',
      name: 'type',
      initialValue: 'options',
      render: <RadioList style={{ width: 300 }} size="middle" optionType="button" buttonStyle="solid" options={TYPES} />,
    },
    {
      title: 'API',
      name: 'api',
      visible: (model) => model.type == 'api',
      render: <SelectApi contextParams={contextParams} responseDemo={demo} />,
    },
    {
      title: 'Dictionary',
      name: 'optionsKey',
      visible: (model) => model.type == 'options',
      render: <SourcePicker />,
    },
    {
      title: '',
      name: 'json',
      visible: (model) => model.type == 'json',
      render: <AbstractTableInput operation={{ width: 60 }} columns={columns} />,
    },
  ];

  return (
    <AbstractForm.ISolation {...props} groups={groups} />
  );
}