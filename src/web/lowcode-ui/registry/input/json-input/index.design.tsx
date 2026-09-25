import React from 'react';
import Runtime, { type JsonInputRuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvancePicker, RadioList } from 'lowcode-blocks';
import { InputNumber } from 'lowcode-kit';

const Themes = [
  { label: 'one_dark', value: 'one_dark' },
  { label: 'tomorrow', value: 'tomorrow' },
];

const ValueTypes = [
  { label: 'string', value: 'json' },
  { label: 'object', value: 'object' },
];

function JsonInputDesigner() {
  const groups: AbstractGroups<JsonInputRuntimeProps> = [
    { title: 'Height', name: 'height', render: <InputNumber /> },
    { title: 'Width', name: 'width', render: <InputNumber /> },
    { title: 'Theme', name: 'theme', render: <AdvancePicker data={Themes} /> },
    { title: 'Value type', name: 'valueType', initialValue: 'json', render: <RadioList optionType="button" options={ValueTypes} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(JsonInputDesigner);
