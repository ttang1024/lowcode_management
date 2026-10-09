/**
 * @module Import
 * @description Import
 */
import React from 'react';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';

interface AddApiSystemProps extends RecordViewProps<RecordModel> { }

export default function AddApiSystem(_props: AddApiSystemProps) {
  // Validation rules
  const rules: AbstractRules = {
    label: [{ required: true, message: 'Please enter the system name' }],
    value: [{ required: true, message: 'Please enter the system code' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    {
      title: 'System name',
      name: 'label',
    },
    {
      title: 'System code',
      name: 'value',
    },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
