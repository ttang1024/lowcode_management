/**
 * @module ApisRecord
 * @description Create / edit a single object, ViewView
 */
import React from 'react';
import { AbstractForm, OptionsPicker } from 'lowcode-blocks';
import type {
  AbstractGroups,
  AbstractRules,
} from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import { CodeEditor } from 'lowcode-ui';

export default function ApisRecord() {
  // Validation rules
  const rules: AbstractRules = {
    type: [{ required: true, message: 'Please choose' }],
    usage: [{ required: true, message: 'Please enter the purpose' }],
    snippet: [{ required: true, message: 'Please set the function' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    {
      title: 'Type',
      name: 'type',
      render: <OptionsPicker optionsKey="function_type" />,
    },
    { title: 'Purpose', name: 'usage' },
    { title: 'Code snippet', name: 'snippet', render: <CodeEditor height={300} /> },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
