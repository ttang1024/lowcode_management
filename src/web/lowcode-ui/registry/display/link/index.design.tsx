import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvancePicker } from 'lowcode-blocks';
import CodeEditor from '../../../src/code-editor';
import { Input } from 'lowcode-kit';
import { LINK_TARGET } from 'lowcode-configs/constants';

function LinkDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Navigation mode',
      name: 'target',
      initialValue: '_self',
      render: <AdvancePicker data={LINK_TARGET} />,
    },
    {
      title: 'Custom text',
      name: 'text',
      render: <Input.TextArea />,
    },
    {
      title: 'Download name',
      name: 'download',
      extra: 'Set this property to enable click-to-download',
      render: <Input />,
    },
    {
      title: 'Navigation link',
      name: 'href',
      layout: { labelCol: { span: 24 } },
      render: (
        <CodeEditor
          sharedKey="model"
          addonBefore="function formatUrl(model) {"
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

export default component.design(Runtime)(LinkDesigner);
