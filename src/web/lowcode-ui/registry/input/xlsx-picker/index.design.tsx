import React from 'react';
import Runtime, { type Mapping, type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import InputNumber from '../input-number';

function XlsxPickerDesigner() {
  const columns: AbstractEColumns<Mapping> = [
    { title: 'Column name', name: 'label', width: 100, editor: ()=> <Input /> },
    { title: 'Property', name: 'key', width: 100, editor: ()=> <Input /> },
  ];

  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Row the column belongs to', name: 'headerIndex', initialValue: 0, render: <InputNumber /> },
    {
      title: '',
      name: 'mappings',
      extra: 'Configure the display name andValue fieldMapping',
      render: <AbstractTableInput scroll={{ x: 380 }} operation={{ width: 60 }} columns={columns} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(XlsxPickerDesigner);
