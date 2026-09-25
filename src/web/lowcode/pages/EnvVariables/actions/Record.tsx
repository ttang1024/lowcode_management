/**
 * @module OptionsRecord
 * @description Create / edit a single object, ViewView
 */
import React from 'react';
import { Textarea } from 'lowcode-kit';
import { AbstractForm, RadioList } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import NameInput from '../NameInput';

const ENV_TYPES = [
  { label: 'Default', value: 'SYS' },
  { label: 'API', value: 'API' },
];

const placeholderMappihngs = {
  'API': 'Please enter the base path of the current API service',
  'SYS': 'Please enter the environment variable value',
};

const extraNodes = {
  'API': 'Base path for all APIs under the specified API system',
  'SYS': 'non-API environment variable',
};

export interface OptionsRecordProps extends RecordViewProps<RecordModel> { }

export default function OptionsRecord(_props: OptionsRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    type: [{ required: true, message: 'Please choose a type' }],
    name: [{ required: true, message: 'Please enter a name' }],
    value: [{ required: true, message: 'Please set the environment variable value' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    {
      title: 'Type',
      name: 'type',
      initialValue: 'SYS',
      render: <RadioList options={ENV_TYPES} optionType="button" />,
    },
    {
      title: 'Variable name',
      name: 'name',
      extra: (r)=> (<>{extraNodes[r.type]}</>),
      render: (r) => <NameInput type={r.type} />,
    },
    {
      title: 'Value',
      name: 'value',
      render: (r) => <Textarea placeholder={placeholderMappihngs[r.type]} rows={3} />,
    },
    {
      title: 'Description',
      name: 'desc',
      render: <Textarea rows={3} />,
    },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
