import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';

const TYPE = [
  { label: 'success', value: 'success' },
  { label: 'Tip', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
];

function AlertDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Warning content',
      name: 'message',
      render: <Input />,
    },
    {
      title: 'Helper text',
      name: 'description',
      render: <Input.TextArea rows={3} />,
    },
    {
      title: 'Closable',
      name: 'closable',
      render: <Switch />,
      extra: 'When enabled, the alert can be dismissed by clicking',
    },
    {
      title: 'Top announcement',
      name: 'banner',
      extra: 'When enabled, a top announcement style is shown',
      render: <Switch />,
    },
    {
      title: 'Warning style',
      name: 'type',
      render: <RadioList optionType="button" buttonStyle="solid" options={TYPE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(AlertDesigner);
