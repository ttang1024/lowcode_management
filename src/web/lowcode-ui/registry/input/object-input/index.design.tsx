import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component, ruler } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, type AbstractRules, RadioList } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import EventPicker from '../../../src/event-picker';
import Pickers from '../../../src/pickers';
import AppIconPicker from '../../../src/app-icon-picker';

const apiResponseDemo = {};

const VALUE_MODE = [
  { value: 'string', label: 'string' },
  { value: 'object', label: 'object' },
];

interface ButtonDesignerProps {
  value: TableButtonModel
}

function ObjectInputDesigner(props: ButtonDesignerProps) {
  const config = props.value;

  // Validation rules
  const rules: AbstractRules = {
    title: [
      ruler.getRule('chooiceRequired', { config: ['title', 'icon'], message: 'Please set at least a button title or icon' }),
    ],
  };

  const exclude = ['api', 'link', 'none'];

  // Form
  const groups: AbstractGroups<RuntimeProps> = [
    {
      group: 'Basic config',
      items: [
        {
          title: 'Value type',
          name: 'valueMode',
          initialValue: 'normal',
          render: <RadioList optionType="button" buttonStyle="solid" options={VALUE_MODE} />,
        },
        { title: 'Name', name: 'title' },
        { title: 'Icon', name: 'icon', extra: 'Button icon', render: <AppIconPicker /> },
        { title: 'Confirm', name: 'needConfirm', render: <Switch /> },
        {
          title: 'Confirmation text',
          name: 'confirm',
          visible: (r) => r.needConfirm, extra: 'When configured, clicking pops up a confirmation dialog',
          render: <Input.TextArea showCount maxLength={100} rows={3} />,
        },
        { title: 'Danger button', name: 'danger', render: <Switch /> },
        { title: 'Button shape', name: 'shape', initialValue: 'default', render: <Pickers.ShapePicker /> },
        { title: 'Button size', name: 'size', initialValue: 'middle', render: <Pickers.SizePicker /> },
        { title: 'Button type', name: 'type', initialValue: '', render: <Pickers.ButtonTypePicker /> },
      ],
    },
    {
      group: 'View config',
      items: [
        {
          title: 'Event type',
          name: 'event',
          render2: (
            <EventPicker
              autoSync
              exclude={exclude}
              initialType="action"
              apiResponse={apiResponseDemo}
              currentAction={config?.event?.action?.name}
            />
          ),
        },
      ],
    },
  ];

  return (
    <AbstractForm
      groups={groups}
      rules={rules}
    />
  );
}

export default component.design(Runtime)(ObjectInputDesigner);
