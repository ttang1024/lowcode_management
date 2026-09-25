import React from 'react';
import { InputNumber } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { AppIconPicker, CodeEditor } from 'lowcode-ui';
import { useScenarioCompletions } from '../components/context-code-editor';
import { COMPLETIONS } from 'lowcode-configs/constants';

export interface FormItemConfigurerProps extends RecordViewProps<FormItemModel, PageConfigurerModel> {
  config: PageConfigurerModel
  outerAction: string
}

export default function FormItemConfigurer() {
  const autoCompletions = useScenarioCompletions('form');

  // Validation rules
  const rules: AbstractRules = {
    group: [{ required: true, message: 'Group nameCannot be empty' }],
  };

  // Form
  const groups: AbstractGroups<FormItemModel> = [
    { title: 'Group name', name: 'group', extra: 'After setting this value, fields up to the next group field belong to the same group' },
    { title: 'Group icon', name: 'groupIcon', render: <AppIconPicker /> },
    {
      title: 'Columns',
      name: 'cols',
      extra: 'Form items per row',
      render: <InputNumber min={1} max={24} />,
    },
    { title: 'Title width', name: 'labelWidth', render: <InputNumber /> },
    { title: 'Row spacing', name: 'lineGap', render: <InputNumber /> },
    {
      title: 'Read-only',
      name: 'readonly',
      layout: { labelCol: { span: 24, offset: 1 }, wrapperCol: { offset: 2 } },
      initialValue: '// Returntrue/falseto controlRead-only }',
      render: (
        <CodeEditor
          sharedKey="model"
          autoCompletions={COMPLETIONS.actionCompletions}
          addonBefore="function isReadOnly(model,props,route) {"
          addonAfter="}"
        />
      ),
    },
    {
      title: 'Display control',
      name: 'visible',
      layout: { labelCol: { span: 24, offset: 1 }, wrapperCol: { offset: 2 } },
      initialValue: '// Returntrue/falseto control visibility }',
      render: (
        <CodeEditor
          sharedKey="model"
          autoCompletions={COMPLETIONS.actionCompletions}
          addonBefore="function visible(model,props,route) {"
          addonAfter="}"
        />
      ),
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider
      value={{ autoCompletions }}
    >
      <AbstractForm rules={rules} autoFocus="group" groups={groups} />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
