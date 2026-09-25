import React from 'react';
import Runtime, { type RuntimeProps, type ConfigItem } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput, RadioList } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import SelectApi from '../../../src/select-api';

const responseDemo = { result: { count: 0, models: [] } };

const SELECT_MODE = [
  { value: 'multiple', label: 'Multi-select' },
  { value: 'single', label: 'Single-select' },
];

function TablePickerDesigner() {
  const columns:AbstractEColumns<ConfigItem> = [
    { title: 'Title', name: 'title', editor: ()=><Input /> },
    { title: 'Property', name: 'name', editor: ()=><Input /> },
  ];

  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Dialog title',
      name: 'title',
      render: <Input />,
    },
    {
      title: 'Button text',
      name: 'btnText',
      render: <Input />,
    },
    {
      title: 'Selection mode',
      name: 'select',
      initialValue: 'multiple',
      render: <RadioList buttonStyle="solid" optionType="button" options={SELECT_MODE} />,
    },
    {
      title: 'API',
      name: 'api',
      render: (row)=>{
        const completions = row.searchFields?.map((item)=>{
          return { value: item.name as string, meta: item.title };
        });
        return (
          <SelectApi contextParams={completions} responseDemo={responseDemo} />
        );
      },
    },
    {
      title: '',
      name: 'columns',
      extra: 'Column config',
      render: <AbstractTableInput scroll={{ x: 380 }} operation={{ width: 60 }} columns={columns} />,
    },
    {
      title: '',
      name: 'searchFields',
      extra: 'Search config',
      render: <AbstractTableInput scroll={{ x: 380 }} operation={{ width: 60 }} columns={columns} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TablePickerDesigner);
