/**
 * @module MockRecord
 * @description APImockConfig
 */
import React from 'react';
import { AbstractForm, OverridePageHeader } from 'lowcode-blocks';
import type {
  AbstractAction,
  AbstractGroups,
  AbstractRules,
  RecordViewProps,
} from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import { JsonInput } from 'lowcode-ui';


interface MockRecordProps extends RecordViewProps<RecordModel> {
  enterSubAction: (action: AbstractAction) => void
  apiPickerKey: string
}

export default function MockRecord(props: MockRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    content: [{ required: true, message: 'Please set mock data' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    {
      title: 'Return data',
      name: 'mock',
      layout: { labelCol: { span: 24 } },
      render: <JsonInput />,
    },
  ];

  // Render
  return (
    <React.Fragment>
      <OverridePageHeader title={`${props.record.name}`} />
      <AbstractForm rules={rules} groups={groups} />
    </React.Fragment>
  );
}
