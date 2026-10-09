/**
 * @module AppPageRecord
 * @description Create / edit a single object, ViewView
 */
import React from 'react';
import { Input, Switch, Textarea } from 'lowcode-kit';
import { AbstractForm, AdvancePicker } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import { IconPicker } from 'lowcode-blocks';

interface AppPageRecordProps extends RecordViewProps<RecordModel> {
  app: AppConfigurerModel
}

export const pageTypes = [
  { label: 'Visual design', value: 1 },
  { label: 'Embedded Iframe', value: 2 },
];

export default function AppPageRecord(props: AppPageRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    name: [{ required: true, message: 'Please enter the page name' }, { max: 30, message: 'At most 30 characters can be entered' }],
    code: [{ required: true, message: 'Please set the page code' }],
  };

  // Form
  const groups: AbstractGroups<RecordModel> = [
    { title: 'Page name', name: 'name', render: <Input maxLength={30} /> },
    {
      title: 'Page code',
      name: 'code',
      disabled: () => props.action !== 'add',
      render: <Input maxLength={15} />,
      extra: 'Page code; used as the route name and must be unique within a system.',
    },
    {
      title: 'Page type',
      name: 'pageType',
      initialValue: 1,
      render: <AdvancePicker data={pageTypes} />,
      extra: '',
    },
    {
      title: 'Page config',
      name: 'pageOption',
      visible: (r) => r.pageType != 1,
      render: <Textarea rows={3} maxLength={300} />,
      extra: 'Page type config; when the page type is iframe this value is the iframe URL',
    },
    {
      title: 'Hide header',
      name: 'options.hideHeader',
      render: <Switch />,
      extra: 'When the header is hidden, the page body gains more vertical space',
    },
    {
      title: 'Page icon',
      name: 'icon',
      render: <IconPicker mode="full" key={props.app?.iconUrl} url={props.app?.iconUrl} />,
      extra: 'Page icon, usable as a menu icon',
    },
    { title: 'Description', name: 'desc', render: <Textarea maxLength={100} rows={4} /> },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
