import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';
import type { AutoCompletion } from '../../../src/code-editor';

const responseDemo = [];

const contextParams:AutoCompletion[] = [
  { value: 'options.filter', meta: 'Filter criteria' },
];

function AvatarDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Value field', name: 'valueKey', initialValue: 'value' },
    {
      title: 'Display template',
      name: 'template',
      extra: 'e.g. {name}-{id}',
      render: <Input.TextArea rows={3} />,
    },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      render: <Switch />,
    },
    {
      title: 'Search mode',
      name: 'search',
      extra: 'When enabled, it is rendered as a search input box',
      render: <Switch />,
    },
    {
      title: 'Dialog width',
      name: 'dropdownMatchSelectWidth',
      extra: 'Make the dropdown the same width as the selector. min-width is set by default and is ignored when smaller than the select box width. false disables virtual scrolling',
      render: <InputNumber />,
    },
    {
      title: 'Input placeholder',
      name: 'placeholder',
    },
    {
      title: 'Search API',
      name: 'api',
      render2: <ApiWrapperPicker contextParams={contextParams} responseDemo={responseDemo} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(AvatarDesigner);
