/**
 * Form pieces shared by ButtonConfigurer (table buttons) and FormButtonConfigurer (form buttons).
 */
import React from 'react';
import { Input, Switch } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractFormItemType, AbstractGroups, AbstractRules } from 'lowcode-blocks/src/interface';
import { AppIconPicker, Pickers, CodeEditor } from 'lowcode-ui';
import { ruler } from 'lowcode-registry';
import { type ContextScenario, useScenarioCompletions } from '../components/context-code-editor';

type BaseButtonModel = Omit<TableButtonModel, 'select' | 'target'>;

// Validation rules
export function createButtonRules(): AbstractRules {
  return {
    title: [
      ruler.getRule('chooiceRequired', { config: ['title', 'icon'], message: 'Please set at least a button title or icon' }),
    ],
  };
}

// Icon, confirmation and appearance items
export function createButtonStyleItems<T extends BaseButtonModel>(): AbstractFormItemType<T>[] {
  return [
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
  ];
}

// Visibility / disabled control code
export function createAvariableItem<T>(addonBefore: string, autoCompletions?: React.ComponentProps<typeof CodeEditor>['autoCompletions']): AbstractFormItemType<T> {
  return {
    title: 'Display control',
    name: 'avariable',
    layout: { labelCol: { span: 24, offset: 1 }, wrapperCol: { offset: 2 } },
    initialValue: '// visibe: Visibility control\n// disabled:Disabled control\n return {\n  visible: true,\n  disabled:false\n }',
    render: (
      <CodeEditor
        sharedKey="model"
        autoCompletions={autoCompletions}
        addonBefore={addonBefore}
        addonAfter="}"
      />
    ),
  };
}

export interface ButtonConfigurerFormProps<T> {
  scenario: ContextScenario
  groups: AbstractGroups<T>
}

export function ButtonConfigurerForm<T>(props: ButtonConfigurerFormProps<T>) {
  const autoCompletions = useScenarioCompletions(props.scenario);
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider value={{ autoCompletions }}>
      <AbstractForm
        groupStyle="tabs" rules={createButtonRules()} groups={props.groups} autoFocus="title"
      />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
