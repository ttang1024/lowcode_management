import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';

function ListItemDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Avatar field', name: 'avatar', visible: false },
    { title: 'Title field', name: 'title', visible: false },
    { title: 'DescriptionField', name: 'description', visible: false },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ListItemDesigner);
