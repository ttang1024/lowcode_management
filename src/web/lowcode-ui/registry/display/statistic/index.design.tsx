import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber } from 'lowcode-kit';

function StatisticDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value title', name: 'title', render: <Input /> },
    { title: 'Value content', name: 'value', render: <Input /> },
    { title: 'Value precision', name: 'precision', render: <InputNumber /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(StatisticDesigner);
