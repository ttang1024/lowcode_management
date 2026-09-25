import React, { useState } from 'react';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, FormItemLayout, RecordViewProps } from 'lowcode-blocks/src/interface';
import { ruler } from 'lowcode-registry';
import { ComponentPicker, ConverterPicker, RulesPicker, CodeEditor } from 'lowcode-ui';
import TemplateInput from 'lowcode-ui/src/template-input';
import { useScenarioCompletions } from '../components/context-code-editor';
import { COMPLETIONS } from 'lowcode-configs/constants';
import type { PageDesignerOptions } from '..';
import ScenarioKeyAutoComplete from '../components/scenario-key-auto-complete';

const completions = ['value'];

const formItemLayout: FormItemLayout = {
  labelCol: {
    flex: '80px',
  },
  wrapperCol: {
  },
};

export interface FormItemConfigurerProps extends RecordViewProps<FormItemModel, PageConfigurerModel> {
  config: PageConfigurerModel
  options: PageDesignerOptions
}

export default function FormItemConfigurer(props: FormItemConfigurerProps) {
  const options = props.options;
  const subActionView = options.subActionView;
  const realView = subActionView ? subActionView : options.actionView;
  const [initialGroups] = useState(realView?.groups.filter((m) => m.name !== props.record?.name));
  const autoCompletions = useScenarioCompletions('form');

  // Validation rules
  const rules: AbstractRules = {
    name: [
      ruler.getRule('include', {
        config: (v) => initialGroups?.find((m) => m.name == v),
        message: 'A property with the same name already exists: {0}',
      }),
    ],
  };

  // Form
  const groups: AbstractGroups<FormItemModel> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Title', name: 'title', placeholder: 'Field name' },
        { title: 'Name', name: 'name', extra: 'Property name, used as the field name when submitting and filling', render: <ScenarioKeyAutoComplete /> },
        { title: 'Default value', name: 'initialValue' },
        { title: 'Title width', name: 'labelWidth', render: <InputNumber min={0} max={400} /> },
        { title: 'Column span', name: 'span', extra: 'Grid layout, 24 columns in total.', render: <InputNumber min={0} max={24} /> },
        { title: 'Offset', name: 'offset', extra: 'Grid layout, 24 columns in total.', render: <InputNumber min={0} max={24} /> },
        { title: 'Prompt text', name: 'placeholder', render: <Input.TextArea rows={3} placeholder="Input placeholderDescription" /> },
        { title: 'DescriptionText', name: 'extra', render: <TemplateInput.TextArea rows={3} placeholder="Field detailsDescription" /> },
        { title: 'Text mode', span: 12, name: 'textonly', render: <Switch /> },
        { title: 'Live feedback', span: 12, name: 'hasFeedback', render: <Switch /> },
        { title: 'Show colon', span: 12, name: 'colon', render: <Switch defaultChecked={true} /> },
        { title: 'Title wrap', span: 12, name: 'titleBreak', render: <Switch defaultChecked={false} /> },
        { title: 'Wrap layout', name: 'break', extra: 'When set, a new row is started', render: <Switch /> },
        { title: 'Validate', name: 'rules', render: <RulesPicker /> },
        {
          title: 'Display control',
          name: 'avariable',
          layout: { labelCol: { span: 24, offset: 3 }, wrapperCol: { offset: 2 } },
          initialValue: '// visibe: Visibility control\n// disabled:Disabled control\n return {\n  visible: true,\n  disabled:false\n }',
          render: (
            <CodeEditor
              sharedKey="model"
              autoCompletions={COMPLETIONS.actionCompletions}
              addonBefore="function avariable(model,props,route) {"
              addonAfter="}"
            />
          ),
        },
        {
          title: 'Linkage',
          name: 'cascade',
          layout: { labelCol: { span: 24, offset: 3 }, wrapperCol: { offset: 2 } },
          initialValue: 'return {\n // you can return the corresponding property values here, \n // to change other forms\n}',
          render: (
            <CodeEditor
              sharedKey="model"
              height={180}
              autoCompletions={completions}
              addonBefore="function cascade(value,model) {"
              addonAfter="}"
            />
          ),
        },
        {
          title: 'DescriptionLinkage',
          name: 'extraFn',
          layout: { labelCol: { span: 24, offset: 3 }, wrapperCol: { offset: 2 } },
          placeholder: 'return {\n   content:"",\n   css:  {\n   }\n }',
          render: (
            <CodeEditor
              sharedKey="model"
              height={180}
              extra="Controls the form footer prompt text; mutually exclusive with extra"
              autoCompletions={completions}
              placeholder={'return { content:"",css:{} }'}
              addonBefore="function extra(value, model) {"
              addonAfter="}"
            />
          ),
        },
      ],
    },
    {
      group: 'Input component',
      items: [
        {
          title: 'Converter',
          name: 'convert',
          render2: <ConverterPicker />,
        },
        {
          title: 'Component',
          name: 'component',
          render2: (record)=> (
            <ComponentPicker
              renderExtra={() => {
                return record.textonly ? <div className="text-red-600">Note: this field has text mode on; the select component will not render</div> : null;
              }}
            />
          ),
        },
      ],
    },
    {
      group: 'Component style',
      items: [
        { title: '', name: 'componentCss', render2: <ComponentPicker.CSSPropertiesInput /> },
      ],
    },
    {
      group: 'Title style',
      items: [
        { title: '', name: 'titleCss', render2: <ComponentPicker.CSSPropertiesInput /> },
      ],
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider value={{ autoCompletions }}>
      <AbstractForm formItemLayout={formItemLayout} groupStyle="tabs" autoFocus="title" rules={rules} groups={groups} />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
