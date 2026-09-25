import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { DATE_TIME_FORMAT, component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';

function DateRangeDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Start field',
      name: 'startKey',
      render: <Input />,
    },
    {
      title: 'End field',
      name: 'endKey',
      initialValue: 'author',
      render: <Input />,
    },
    {
      title: 'Separator',
      name: 'joinChar',
      render: <Input />,
    },
    {
      title: 'Date format',
      name: 'fmt',
      initialValue: DATE_TIME_FORMAT,
      render: <Input />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(DateRangeDesigner);
