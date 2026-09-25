import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import CodeEditor from '../../../src/code-editor';
import { SizePicker } from '../../../src/pickers';

function DateRangePickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'Display time',
      name: 'showTime',
      extra: 'When enabled, hours can be selected',
      render: <Switch />,
    },
    {
      title: 'Hour',
      name: 'showHour',
      initialValue: true,
      visible: (r) => !!r.showTime,
      render: <Switch />,
    },
    {
      title: 'Minute',
      name: 'showMinute',
      initialValue: true,
      visible: (r) => !!r.showTime,
      render: <Switch />,
    },
    {
      title: 'seconds',
      name: 'showSecond',
      initialValue: true,
      visible: (r) => !!r.showTime,
      render: <Switch />,
    },
    { title: 'Format', name: 'format', extra: 'e.g. yyyy-MM-DD' },
    { title: 'Prompt text', name: 'placeholder', render: <Input /> },
    { title: 'Control size', name: 'size', render: <SizePicker /> },
    {
      title: 'Disable-date function',
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

export default component.design(Runtime)(DateRangePickerDesigner);
