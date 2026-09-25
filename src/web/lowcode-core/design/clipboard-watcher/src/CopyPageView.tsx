import { Input, toast, Switch } from 'lowcode-kit';
import { AbstractForm, type AbstractGroups, AbstractObject, type AbstractRules } from 'lowcode-blocks';
import type { AppPageModel } from 'lowcode-api/models';
import { AppPageService, ResourceService } from 'lowcode-services';
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'lowcode-common';
import AppContext from '../../../runtime/app-context';

export interface CopyPageViewProps {
  data: ClipboardDesignModel
  onClose: () => void
}

export default function CopyPageView(props: CopyPageViewProps) {
  const action = props.data ? 'copy-page' : '';
  const config = props.data?.data;
  const context = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();

  const rules: AbstractRules = {
    name: [{ required: true, message: 'Please enter the page name' }, { max: 30, message: 'At most 30 characters can be entered' }],
    code: [{ required: true, message: 'Please set the page code' }],
  };

  const groups: AbstractGroups<AppPageModel> = [
    { title: 'Page name', name: 'name', render: <Input maxLength={30} /> },
    {
      title: 'Page code',
      name: 'code',
      render: <Input showCount maxLength={15} />,
      extra: 'The code is copied from the source page; if it already exists you must change the code to copy again',
    },
    {
      title: 'Overwrite page',
      name: 'overwrite',
      extra: 'When enabled, the original page data is overwritten; choose carefully',
      render: <Switch />,
    },
  ];

  const onSubmit = async(values: AppPageModel) => {
    values.appCode = context.config.code;
    const res = await AppPageService.copyPage(values, config);
    if (res.overwriteOk && res.config) {
      const config2 = res.config;
      config2.version = config2.version - 1;
      // if the page exists on the server, it is not synced directlyjsonfile; the local cache is used instead
      ResourceService.persistPageConfig(values.appCode, values.code, config2);
    }

    toast.success('Copied successfully');
    props.onClose();
    const url = `/design/${values.appCode}/${values.code}/list`;
    if (location.pathname == url) {
      window.location.reload();
    } else {
      history.push(url);
    }
  };

  return (
    <AbstractObject
      title="Copy page"
      action={action}
      type="modal"
      width={800}
      record={config}
      onSubmit={onSubmit}
      onCancel={props.onClose}
    >

      <AbstractForm groups={groups} rules={rules} />

    </AbstractObject>
  );
}