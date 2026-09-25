import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';
import { SizePicker } from '../../../src/pickers';

const STYLE = [
  { label: 'outline', value: 'outline' },
  { label: 'solid', value: 'solid' },
];

const TYPE = [
  { label: 'default', value: 'default' },
  { label: 'button', value: 'button' },
];

const responseDemo = [];

function RadioDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueName', initialValue: 'value' },
    { title: 'Title field', name: 'labelName', initialValue: 'label' },
    {
      title: 'Title formatter',
      name: 'formatLabel',
      render: <Input.TextArea rows={3} />,
      extra: 'Supports template strings, e.g. {name}-{age}',
    },
    { title: 'Option style', name: 'optionType', render: <RadioList defaultValue="default" options={TYPE} /> },
    { title: 'Option type', name: 'buttonStyle', render: <RadioList defaultValue="outline" options={STYLE} />, visible: i => i.optionType === 'button' },
    { title: 'Control size', name: 'size', render: <SizePicker />, visible: i => i.optionType === 'button' },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(RadioDesigner);
