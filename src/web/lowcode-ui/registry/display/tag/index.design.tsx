import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { ColorPicker } from 'lowcode-ui';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Switch } from 'lowcode-kit';

function TagsDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Closable',
      name: 'closable',
      render: <Switch />,
    },
    {
      title: 'Tag color',
      name: 'color',
      render: <ColorPicker/>,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TagsDesigner);
