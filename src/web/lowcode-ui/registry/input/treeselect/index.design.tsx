import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';

const responseDemo = [];

function TreeSelectDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueKey', initialValue: 'id' },
    { title: 'Title field', name: 'labelKey', initialValue: 'title' },
    { title: 'Parent field', name: 'parentKey', initialValue: 'parentId' },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
    { title: 'Clear button', name: 'allowClear', render: <Switch /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TreeSelectDesigner);
