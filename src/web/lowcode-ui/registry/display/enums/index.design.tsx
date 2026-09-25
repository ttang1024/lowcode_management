import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import SourcePicker from '../../../src/source-picker';

function EnumsDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueName', initialValue: 'value' },
    { title: 'Title field', name: 'labelName', initialValue: 'label' },
    { title: 'Data source', name: 'optionsKey', render: <SourcePicker /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(EnumsDesigner);
