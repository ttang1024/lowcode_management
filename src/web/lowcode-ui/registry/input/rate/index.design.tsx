import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import AppIconPicker from '../../../src/app-icon-picker';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';

AbstractForm.registerConverter('rate-tooltips', {
  name: 'rate-tooltips',
  getValue: (items)=> items?.map((item)=>item.title),
  setInput: (v) => {
    const items = v instanceof Array ? v : [v].filter((v)=>!!v);
    return items.map((item)=>{
      return { title: item };
    });
  },
});

function RateDesigner() {
  const columns: AbstractEColumns<any> = [
    { title: 'Description', name: 'title', editor: () => <Input /> },
  ];

  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Total', name: 'count', render: <InputNumber min={1} /> },
    { title: 'Allow half-select', name: 'allowHalf', render: <Switch /> },
    { title: 'Custom characters', name: 'character', render: <AppIconPicker /> },
    {
      title: '',
      name: 'tooltips',
      convert: 'rate-tooltips',
      render: <AbstractTableInput hideOperation columns={columns} />,
    },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      initialValue: true,
      render: <Switch />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(RateDesigner);
