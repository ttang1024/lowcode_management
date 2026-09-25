import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';

const TYPE = [
  { label: 'success', value: 'success' },
  { label: 'error', value: 'error' },
  { label: 'info', value: 'info' },
  { label: 'warning', value: 'warning' },
  { label: '404', value: '404' },
  { label: '403', value: '403' },
  { label: '500', value: '500' },
];

function ResultDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Title',
      name: 'title',
      render: <Input />,
    },
    {
      title: 'Subtitle',
      name: 'subTitle',
      render: <Input.TextArea rows={3} />,
    },
    {
      title: 'Custom icon',
      name: 'icon',
      render: <Input />,
    },
    {
      title: 'Result status',
      name: 'status',
      extra: 'determines the icon and color',
      render: <RadioList options={TYPE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ResultDesigner);
