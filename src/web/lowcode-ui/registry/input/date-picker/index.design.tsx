import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvancePicker } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import CodeEditor from '../../../src/code-editor';
import { SizePicker } from '../../../src/pickers';

const TYPES = [
  { label: 'Date picker', value: 'date' },
  { label: 'Month picker', value: 'month' },
  { label: 'Year picker', value: 'year' },
  { label: 'Week picker', value: 'week' },
  { label: 'Quarter picker', value: 'quarter' },
];

function DatePickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Picker type', name: 'picker', render: <AdvancePicker data={TYPES} /> },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      initialValue: true,
      render: <Switch />,
    },
    { title: 'Time picker', name: 'showTime', render: <Switch />, visible: i => i.picker === 'date' },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    {
      title: 'Disabled dates',
      name: 'disabledDate',
      layout: { labelCol: { span: 24 } },
      initialValue: '// Returntrue/falseto indicate whether the current date is disabled\n',
      render: (
        <CodeEditor
          shared
          sharedKey="context"
          autoCompletions={['date', 'today', 'moment']}
          addonBefore="disabledDate(date,today,moment,context) {"
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

export default component.design(Runtime)(DatePickerDesigner);
