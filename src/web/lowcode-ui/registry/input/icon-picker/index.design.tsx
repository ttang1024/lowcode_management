import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';

function IconPickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [

  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(IconPickerDesigner);
