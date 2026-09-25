/**
 * @module OptionsRecord
 * @description Create / edit a single object, ViewView
 */
import React from 'react';
import { Input, Alert } from 'lowcode-kit';
import { AbstractForm, AbstractTableInput, RadioList } from 'lowcode-blocks';
import type { AbstractEColumns, AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import { ruler } from 'lowcode-registry';
import { JsonInput } from 'lowcode-ui';

const DATA_TYPES = [
  { label: 'Options', value: 0 },
  { label: 'JSON', value: 1 },
];

export interface OptionsRecordProps extends RecordViewProps<RecordModel> { }

export default function OptionsRecord(_props: OptionsRecordProps) {
  const columns: AbstractEColumns<OptionItemValue> = [
    { title: 'Name', name: 'label', editor: () => <Input maxLength={100} /> },
    { title: 'Value', name: 'value', editor: () => <Input maxLength={200} /> },
  ];

  // Validation rules
  const rules: AbstractRules = {
    name: [{ required: true, message: 'Please enter a name' }],
    code: [{ required: true, message: 'Please set the dictionary code' }, ruler.getRule('avariable')],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    { title: 'Name', name: 'name' },
    { title: 'code', name: 'code', extra: 'Please use English for naming' },
    {
      title: 'Type',
      name: 'type',
      initialValue: 0,
      extra: (<Alert className="mt-2.5" type="warning">Don’t put sensitive data in dictionaries — dictionary values are public.</Alert>),
      render: <RadioList optionType="button" buttonStyle="solid" options={DATA_TYPES} />,
    },
    {
      title: 'Value list',
      name: 'value',
      render: (model) => {
        switch (model.type) {
          case 1:
            return <JsonInput />;
          default:
            return <AbstractTableInput moveable columns={columns} />;
        }
      },
    },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
