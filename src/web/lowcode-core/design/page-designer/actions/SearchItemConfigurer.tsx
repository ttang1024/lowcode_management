import React, { useState } from 'react';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { ruler } from 'lowcode-registry';
import { ComponentPicker, ConverterPicker, CodeEditor, InitialValueSetting } from 'lowcode-ui';
import { useScenarioCompletions } from '../components/context-code-editor';
import ScenarioKeyAutoComplete from '../components/scenario-key-auto-complete';

export interface SearchItemConfigurerProps extends RecordViewProps<TableSearchModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

const completions = ['value'];

export interface SearchModel {
  name: string;
  title: string;
}

export default function SearchItemConfigurer(props: SearchItemConfigurerProps) {
  const [initialFields] = useState(props.config.searchFields.filter((m) => m.name !== props.record?.name));
  const autoCompletions = useScenarioCompletions('search');

  // Validation rules
  const rules: AbstractRules = {
    name: [
      { required: true, message: 'Please set the property name' },
      ruler.getRule('include', {
        config: (v) => initialFields.find((m) => m.name == v),
        message: 'A search field with the same property name already exists: {0}',
      }),
    ],
  };

  // Form
  const groups: AbstractGroups<TableSearchModel> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Title', name: 'title' },
        { title: 'Name', name: 'name', render: <ScenarioKeyAutoComplete />, extra: 'Property name, used as the field name in queries' },
        { title: 'Default value', name: 'initialValueObj', render2: <InitialValueSetting /> },
        { title: 'Column span', name: 'span', extra: 'Grid layout, 24 columns in total.', render: <InputNumber min={0} max={24} /> },
        { title: 'Title width', name: 'labelWidth', render: <InputNumber min={0} max={400} /> },
        { title: 'Wrap layout', name: 'break', extra: 'When set, a new row is started', render: <Switch /> },
        { title: 'Prompt text', name: 'placeholder', render: <Input.TextArea rows={3} placeholder="Input placeholderDescription" /> },
        { title: 'DescriptionText', name: 'extra', render: <Input.TextArea rows={3} placeholder="Search itemDescription" /> },
        { title: 'Whether disabled', name: 'disabled', render: <Switch /> },
        { title: 'Auto submit', name: 'auto', extra: 'When enabled, typing immediately triggers a query. ', render: <Switch /> },
        {
          title: 'Linkage',
          name: 'cascade',
          layout: { labelCol: { span: 24, offset: 3 }, wrapperCol: { offset: 2 } },
          initialValue: 'return {\n // you can return the corresponding property values here, \n // to change other forms\n}\n',
          render: (
            <CodeEditor
              sharedKey="model"
              autoCompletions={completions}
              height={180}
              addonBefore="function cascade(value,model) {"
              addonAfter="}"
            />
          ),
        },
      ],
    },
    {
      group: 'Component',
      items: [
        { title: 'Converter', name: 'convert', render2: <ConverterPicker /> },
        { title: 'Component type', name: 'component', render2: <ComponentPicker /> },
      ],
    },
    {
      group: 'Component style',
      items: [
        { title: '', name: 'componentCss', render2: <ComponentPicker.CSSPropertiesInput /> },
      ],
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider
      value={{ autoCompletions }}
    >
      <AbstractForm groupStyle="tabs" autoFocus="title" rules={rules} groups={groups} />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
