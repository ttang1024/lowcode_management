import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput, RadioList } from 'lowcode-blocks';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import type { Mapping } from './index';
import { Input, Switch, InputNumber } from 'lowcode-kit';

const SIZE = [
  { label: 'Large', value: 'large' },
  { label: 'Center', value: 'middle' },
  { label: 'Small', value: 'small' },
];

function DescriptionsDesigner() {
  const columns: AbstractEColumns<Mapping> = [
    { title: 'Name', name: 'label', width: 120, editor: ()=> <Input /> },
    { title: 'Value', name: 'value', width: 120, editor: ()=> <Input /> },
    { title: 'Column span', name: 'span', width: 60, editor: ()=> <InputNumber /> },
  ];

  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Title', name: 'title' },
    {
      title: '',
      name: 'mappings',
      extra: 'Configure the display name andValue fieldMapping',
      render: <AbstractTableInput scroll={{ x: 380 }} operation={{ width: 60 }} columns={columns} />,
    },
    { title: 'Colon', name: 'colon', render: <Switch defaultChecked={true} /> },
    { title: 'Border', name: 'bordered', render: <Switch /> },
    { title: 'Vertical layout', name: 'vertical', render: <Switch /> },
    { title: 'Size', name: 'size', render: <RadioList options={SIZE} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(DescriptionsDesigner);
