/**
 * @module ApisRecord
 * @description Create / edit a single object, ViewView
 */
import React, { useCallback } from 'react';
import { AbstractForm, AdvancePicker, OptionsPicker } from 'lowcode-blocks';
import type {
  AbstractAction,
  AbstractGroups,
  AbstractRules,
  RecordViewProps,
} from 'lowcode-blocks/src/interface';
import {
  API_METHODS,
  CONTENT_TYPE,
  RESPONSE_TYPE,
} from 'lowcode-configs/constants';
import type { RecordModel } from '../model';
import TagGroup from '../components/tag-group';
import { Button } from 'lowcode-kit';
import lowcodeConfigs from 'lowcode-configs';
import { Link } from 'react-router-dom';

const allowBody = ['POST', 'PUT'];

export interface ApisRecordProps extends RecordViewProps<RecordModel> {
  enterSubAction: (action: AbstractAction) => void
  apiPickerKey: string
}

export default function ApisRecord(props: ApisRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    system: [{ required: true, message: 'Please choose an API system' }],
    name: [{ required: true, message: 'Please enter the API description' }],
    method: [{ required: true, message: 'Please set method' }],
    path: [{ required: true, message: 'Please set path' }],
    contentType: [{ required: true, message: 'Please choose an app type' }],
    responseType: [{ required: true, message: 'Please choose a return type' }],
  };

  const onAddSys = useCallback(() => props.enterSubAction({ action: 'add-sys', id: '' }), []);

  // Form
  const groups: AbstractGroups<RecordModel> = [
    {
      title: 'API system',
      name: 'system',
      render: <OptionsPicker key={props.apiPickerKey} optionsKey={lowcodeConfigs.API_SYSTEM_KEY} />,
      extra: (
        <>
          <Button onClick={onAddSys} variant="link" size="sm">System not listed? Add one</Button>
          <div>
            if needed, you can go to
            <Link to="/admin/env/list">Environment variables</Link>
            Set a dedicated base path for the current system
          </div>
        </>
      ),
    },
    {
      title: 'API name',
      name: 'name',
      disabled: () => props.action !== 'add',
      extra: 'API names are globally unique; choose carefully. ',
    },
    {
      title: 'method',
      name: 'method',
      render: <AdvancePicker data={API_METHODS} />,
    },
    {
      title: 'path',
      name: 'path',
      extra: (
        <div>
          the domain for relative paths is: {lowcodeConfigs.API}
          <div>for external APIs, enter an absolute path</div>
        </div>),
    },
    // { title: 'headers', name: 'headers', render: <TagGroup /> },
    {
      title: 'body params',
      name: 'params.body',
      visible: (model) => allowBody.indexOf(model.method) > -1,
      render: <TagGroup />,
    },
    {
      title: 'query params',
      name: 'params.query',
      render: <TagGroup />,
    },
    {
      title: 'Content type',
      name: 'contentType',
      initialValue: CONTENT_TYPE[0].value,
      render: <AdvancePicker data={CONTENT_TYPE} />,
    },
    {
      title: 'Return type',
      name: 'responseType',
      initialValue: 'json',
      render: <AdvancePicker data={RESPONSE_TYPE} />,
    },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
