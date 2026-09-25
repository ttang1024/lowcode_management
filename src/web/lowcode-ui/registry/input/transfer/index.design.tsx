import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';

const responseDemo = [];

function TransferDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueName', render: <Input /> },
    { title: 'One-way', name: 'oneWay', render: <Switch /> },
    { title: 'Show search', name: 'showSearch', render: <Switch /> },
    {
      title: 'Select all',
      name: 'showSelectAll',
      extra: 'Whether to show the select-all checkbox',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'Pagination',
      name: 'pagination',
      normalize: (v) => v == true ? undefined : false,
      render: <Switch />,
    },
    { title: 'Width', name: 'width', render: <InputNumber /> },
    { title: 'Height', name: 'height', render: <InputNumber /> },
    { title: 'Move-left text', name: 'left', render: <Input /> },
    { title: 'Move-right text', name: 'right', render: <Input /> },
    { title: 'Left title', name: 'leftTitle', render: <Input /> },
    { title: 'Right title', name: 'rightTitle', render: <Input /> },
    {
      title: 'Display template',
      name: 'template',
      render: <Input.TextArea rows={3} />,
      extra: 'e.g. {title}-{description}',
    },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TransferDesigner);
