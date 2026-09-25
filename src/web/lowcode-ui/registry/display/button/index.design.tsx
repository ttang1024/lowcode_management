import React, { useMemo } from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component, ruler } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, type AbstractRules } from 'lowcode-blocks';
import { Input, Switch } from 'lowcode-kit';
import EventPicker from '../../../src/event-picker';
import Pickers from '../../../src/pickers';
import AppIconPicker from '../../../src/app-icon-picker';
import { usePageNodeContext } from 'lowcode-core/design/lowcode-designer';
import type { AutoCompletion } from '../../../src/code-editor';
import ComponentPicker from '../../../src/component-picker';

const apiResponseDemo = {
  result: {},
};

const apiParameters:AutoCompletion[] = [
  { meta: 'the data entered in the current input', value: 'context.input', full: true },
];

interface ButtonDesignerProps {
  value: TableButtonModel
}

function ButtonDesigner(props: ButtonDesignerProps) {
  const config = props.value;
  const context = usePageNodeContext();

  // Validation rules
  const rules: AbstractRules = {
    title: [
      ruler.getRule('chooiceRequired', { config: ['title', 'icon'], message: 'Please set at least a button title or icon' }),
    ],
  };

  const exclude = useMemo(() => {
    return context.options?.subAction ? ['view'] : undefined;
  }, [context.options?.subAction]);

  // Form
  const groups: AbstractGroups<RuntimeProps> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Name', name: 'title' },
        {
          title: 'Input',
          name: 'showInput',
          render: <Switch />,
          extra: 'Whether to show the input before the button',
        },
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
        {
          title: 'Validate the form',
          name: 'needValidate',
          extra: 'When enabled, the event runs only after the form is fully filled in',
          initialValue: '', render: <Switch />,
        },
      ],
    },
    {
      group: 'Event config',
      items: [
        {
          title: 'Event type',
          name: 'event',
          initialValue: { noApiMessage: true },
          render2: (
            <EventPicker
              autoSync
              exclude={exclude}
              apiResponse={apiResponseDemo}
              apiSharedKey="context.record"
              onlyApiParameters={apiParameters}
              closeOnSubmitInitialValue={false}
              apiReloadInitialValue={[]}
              actionReloadInitialValue={[]}
              currentAction={config?.event?.action?.name}
            />
          ),
        },
      ],
    },
    {
      group: 'Input component',
      items: [
        {
          title: 'Trigger on Enter',
          name: 'enter',
          extra: 'When enabled, pressing Enter triggers the button click',
          render: <Switch />,
        },
        {
          title: '',
          name: 'input',
          render2: (
            <ComponentPicker />
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

export default component.design(Runtime)(ButtonDesigner);
