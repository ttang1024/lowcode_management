import React, { useState } from 'react';
import { Input, InputNumber, Switch } from 'lowcode-kit';
import { AbstractForm, RadioList } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { ruler } from 'lowcode-registry';
import { COLUMN_FIXED } from 'lowcode-configs/constants';
import { ComponentPicker, CodeEditor } from 'lowcode-ui';
import { useScenarioCompletions } from '../components/context-code-editor';
import ScenarioKeyAutoComplete from '../components/scenario-key-auto-complete';

export interface TableColumnConfigurerProps extends RecordViewProps<TableColumnModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

export default function TableColumnConfigurer(props: TableColumnConfigurerProps) {
  const record = props.record;
  const [initialColumns] = useState(props.config.columns.filter((m) => m.name !== props.record?.name));
  const autoCompletions = useScenarioCompletions('table');

  // Validation rules
  const rules: AbstractRules = {
    name: [
      { required: true, message: 'Please enter the property name of the current column' },
      ruler.getRule('avariable'),
      ruler.getRule('include', {
        config: (v) => initialColumns.find((m) => m.name == v),
        message: 'A column with the same property name already exists: {0}',
      }),
    ],
  };


  // Form
  const groups: AbstractGroups<TableColumnModel> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Title', name: 'title' },
        { title: 'Property name', name: 'name', render: <ScenarioKeyAutoComplete /> },
        { title: 'Column width', name: 'width', render: <InputNumber min={50} /> },
        { title: 'Field order', name: 'sortable', render: <Switch /> },
        { title: 'Sort field name', name: 'sort', initialValue: record?.name, visible: (row) => row.sortable },
        { title: 'Auto ellipsis', name: 'ellipsis', render: <Switch />, initialValue: true, extra: 'When content is too long, show an ellipsis. ' },
        { title: 'Fixed column', name: 'fixed', render: <RadioList size="small" options={COLUMN_FIXED} /> },
      ],
    },
    {
      group: 'Format',
      items: [
        { title: 'Value property name',
          name: 'valueName',
          render: <Input />,
          initialValue: 'value',
          extra: 'Defaults to: value',
        },
        { title: 'Format', name: 'formatter', render2: <ComponentPicker /> },
      ],
    },
    {
      group: 'Formatter style',
      items: [
        { title: '', name: 'componentCss', render2: <ComponentPicker.CSSPropertiesInput /> },
      ],
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider value={{ autoCompletions }}>
      <AbstractForm groupStyle="tabs" rules={rules} groups={groups} />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
