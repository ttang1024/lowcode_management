import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';
import { SizePicker } from '../../../src/pickers';
import EventPicker from '../../../src/event-picker';
import type { AutoCompletion } from '../../../src/code-editor';

const responseDemo = {

};

const apiAutoCompletions: AutoCompletion[] = [
  {
    meta: 'whether currently selected',
    value: 'checked',
  },
  {
    meta: 'model',
    value: 'model',
  },
];

function SwitchDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Selected',
      name: 'checkedChildren',
      render: <Input />,
      extra: 'Content when checked',
    },
    {
      title: 'Unselected',
      name: 'unCheckedChildren',
      render: <Input />,
      extra: 'Content when unchecked',
    },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    { title: 'Confirmation text 1',
      name: 'yesConfirm',
      render: <Input.TextArea />,
      extra: 'Confirmation text shown before selecting',
    },
    {
      title: 'Confirmation text 2',
      name: 'noConfirm',
      render: <Input.TextArea />,
      extra: 'Confirmation text shown before deselecting',
    },
    {
      title: 'API',
      name: 'event',
      render2: (
        <EventPicker
          apiSharedKey="context.model"
          apiParameters={apiAutoCompletions}
          apiExtra={'API called when the control value toggles'}
          exclude={['action', 'link']}
          apiResponse={responseDemo}
        />
      ),
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(SwitchDesigner);
