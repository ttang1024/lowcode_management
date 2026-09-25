import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { DATE_TIME_FORMAT, component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';

function DateViewDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Format',
      name: 'fmt',
      initialValue: DATE_TIME_FORMAT,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(DateViewDesigner);
