import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { DATE_TIME_FORMAT, component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';

const responseDemo = {
  count: 0,
  models: [],
};

const MODE = [
  { label: 'Left', value: 'left' },
  { label: 'Alternating', value: 'alternate' },
  { label: 'Right', value: 'right' },
];

function TimelineDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Mode',
      name: 'mode',
      initialValue: '',
      render: <RadioList optionType="button" buttonStyle="solid" options={MODE} />,
    },
    {
      title: 'Date field',
      name: 'dateKey',
      initialValue: 'date',
    },
    {
      title: 'Date format',
      name: 'fmt',
      initialValue: DATE_TIME_FORMAT,
    },
    {
      title: 'DescriptionFormat',
      name: 'template',
      extra: 'You can assemble content with placeholders, e.g. {name}-{id}',
      initialValue: '{desc}',
      render: <Input.TextArea rows={3} />,
    },
    {
      title: 'Descending',
      name: 'reverse',
      render: <Switch />,
    },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TimelineDesigner);
