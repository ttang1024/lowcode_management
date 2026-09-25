import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';

const responseDemo = [];

function CheckboxDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueName', initialValue: 'value' },
    { title: 'Title field', name: 'labelName', initialValue: 'label' },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(CheckboxDesigner);
