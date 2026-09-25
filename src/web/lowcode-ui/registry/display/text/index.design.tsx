import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import CodeEditor from '../../../src/code-editor';
import { Switch } from 'lowcode-kit';

function TextDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Default content', name: 'content' },
    { title: 'Auto ellipsis', name: 'ellipsis', render: <Switch /> },
    {
      title: 'Custom content',
      name: 'format',
      layout: { labelCol: { span: 24, offset: 1 }, wrapperCol: { offset: 2 } },
      render: (
        <CodeEditor
          sharedKey="model"
          addonBefore="function format(model,route) {"
          addonAfter="}"
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

export default component.design(Runtime)(TextDesigner);
