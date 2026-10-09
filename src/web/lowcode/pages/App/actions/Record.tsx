/**
 * @module AppRecord
 * @description Create / edit a single object, ViewView
 */
import React, { useCallback } from 'react';
import { Input, Textarea } from 'lowcode-kit';
import { AbstractForm, AdvanceUpload, IconPicker } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import { Pickers } from 'lowcode-ui';
import { AppService } from 'lowcode-services';
import config from 'lowcode-configs';

const DEFAULT_LOGO = `${config.CDN}/lowcode/resources/lowcode/logo.jpeg`;

interface AppRecordProps extends RecordViewProps<RecordModel> { }

export default function AppRecord(props: AppRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    name: [{ required: true, message: 'Please enter the app name' }],
    code: [{ required: true, message: 'Please enter the app code' }],
    // logo: [{ required: true, message: 'Please upload the system logo' }],
    appId: [{ required: true, message: 'Please set AppID' }],
    owner: [{ required: true, message: 'Please enter the owner' }],
  };

  const useDefaultLogo = useCallback(() => {
    props.form.current.setFieldValue('logo', DEFAULT_LOGO);
  }, []);

  // Form
  const groups: AbstractGroups<RecordModel> = [
    { title: 'App name', name: 'name' },
    {
      title: 'App code',
      name: 'code',
      disabled: () => props.action != 'add',
      extra: (data) => {
        return (
          <div>
            <div>{`APPID=${AppService.convertAppId(data.code)}`}</div>
            The code is part of the app’s URL and is also its Member Center AppID, so it can’t be changed later.
          </div>
        );
      },
      render: <Input maxLength={32} />,
    },
    {
      title: 'Logo',
      name: 'logo',
      initialValue: DEFAULT_LOGO,
      render: <AdvanceUpload type="drag" />,
      extra: (
        <div>
          Recommended size: 40 x 40
          <a onClick={useDefaultLogo} style={{ marginLeft: 20 }}>Use defaultLogo</a>
        </div>
      ),
    },
    {
      title: 'Home page URL',
      name: 'home',
      extra: 'Default URL when accessing the system home page. ',
    },
    {
      title: 'Component bundle',
      name: 'packages',
      render: <Pickers.PackagePicker mode="multiple" />,
    },
    { title: 'Icon library', name: 'iconUrl', render: <IconPicker.Input />, extra: 'Icon-font library URL; prefer an http/https iconfont.css file' },
    { title: 'Owner', name: 'owner' },
    { title: 'Description', name: 'desc', render: <Textarea rows={4} /> },
  ];

  // Render
  return <AbstractForm rules={rules} groups={groups} />;
}
