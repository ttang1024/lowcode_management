import React from 'react';
import ConverterRegistry, { DATE_TIME_FORMAT } from './index';
import { Input } from 'lowcode-kit';
import { CodeEditor } from 'lowcode-ui';

const placeholder = `return {
  getValue(v) {
    return v;
  },
  setValue(v) {
    return v;
  },
};`;

ConverterRegistry.setOptions({
  name: 'moment',
  options: [
    { title: 'Format', name: 'fmt', render: <Input defaultValue={DATE_TIME_FORMAT} /> },
  ],
});

ConverterRegistry.setOptions({
  name: 'custom',
  options: [
    {
      title: 'Custom reader/writer',
      name: 'fn',
      layout: { labelCol: { span: 24 } },
      initialValue: placeholder,
      render: (
        <CodeEditor
          className=""
          addonBefore="function createConverter()"
          addonAfter="}"
        />
      ),
    },
  ],
});