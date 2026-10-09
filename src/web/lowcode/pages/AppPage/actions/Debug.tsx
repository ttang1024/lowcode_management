/**
 * @module DebugPackage
 * @description Debug component bundle
 */
import React from 'react';
import { AbstractForm, AdvancePicker } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';

interface AppPageDebugProps extends RecordViewProps<RecordModel> {
  app: AppConfigurerModel
}

export default function AppPageDebug(props: AppPageDebugProps) {
  const packages = (props.app?.packages || []).map((value)=>{
    return { label: value, value };
  });

  // Validation rules
  const rules: AbstractRules = {
    pkg: [{ required: true, message: 'Please choose a component bundle to debug' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    { title: 'Component bundle', name: 'pkg', render: <AdvancePicker data={packages} /> },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
