import React from 'react';
import { Input, Switch } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules } from 'lowcode-blocks/src/interface';
import { LoggerService } from 'lowcode-services';

export interface PublishConfigurerProps {
  config: PageConfigurerModel
}

export default function PublishConfigurer(props: PublishConfigurerProps) {
  const pageCode = props.config.code;
  const latest = LoggerService.useQuery().getPageLatestVersion(props.config.appCode, pageCode);

  // Validation rules
  const rules: AbstractRules = {
    tag: [{ required: true, message: 'Please set the version' }],
    description: [{ required: true, message: 'Please enter a note' }],
  };

  // Form
  const groups: AbstractGroups<PagePublishModel> = [
    { title: 'Version', name: 'tag', extra: () => `Previous version:${latest.data?.result?.tag || ''}` },
    {
      title: 'Description',
      name: 'description',
      render: <Input.TextArea rows={3} maxLength={240} />,
    },
    {
      title: 'Document link',
      name: 'docUrl',
      render: <Input.TextArea rows={3} maxLength={200} />,
    },
    {
      title: 'Enable backup',
      name: 'backup',
      initialValue: true,
      extra: 'Keeps this version as a restore point in the publish history',
      render: <Switch />,
    },
  ];

  // Render
  return <AbstractForm autoFocus="version" rules={rules} groups={groups} />;
}
