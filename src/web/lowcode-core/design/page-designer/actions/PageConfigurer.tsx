import React from 'react';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { JsonInput } from 'lowcode-ui';

export interface PageConfigurerProps extends RecordViewProps<PagePublishModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

export default function PageConfigurer() {
  // Validation rules
  const rules: AbstractRules = {
    config: [
      { required: true, message: 'ConfigCannot be empty' },
      {

        validator: (rule, value) => {
          return value !== 'error' ? Promise.resolve() : Promise.reject('Invalid JSON');
        },
      }],
  };

  // Form
  const groups: AbstractGroups<PagePublishModel> = [
    {
      title: '',
      name: 'config',
      className: 'page-config-item',
      render: <JsonInput className="page-json-input" foldLevel={1} />,
    },
  ];

  // Render
  return <AbstractForm autoFocus="version" rules={rules} groups={groups} />;
}
