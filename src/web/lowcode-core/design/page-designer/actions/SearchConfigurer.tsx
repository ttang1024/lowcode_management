import React from 'react';
import { Switch } from 'lowcode-kit';
import { AbstractForm, AdvancePicker } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { SelectApi, AppIconPicker, Pickers, CodeEditor } from 'lowcode-ui';
import XSortableList from '../components/x-sortable-list';
import InputNumber from 'lowcode-ui/registry/input/input-number';
import { useScenarioCompletions } from '../components/context-code-editor';
import type { EnterAction } from './types';
import { REFRESH_MODE } from 'lowcode-configs/constants';

const responseDemo = { result: { count: 0, models: [] } };

export interface SearchConfigurerProps extends RecordViewProps<TableSearchModel, PageConfigurerModel> {
  config: PageConfigurerModel
  isInitialize?: boolean
  enterAction: EnterAction
}

export default function SearchConfigurer(props: SearchConfigurerProps) {
  const activeIndex = props.isInitialize ? 1 : 0;

  const autoCompletions = useScenarioCompletions('search');

  const onEdit = (item: TableSearchModel, index: number) => {
    props.enterAction('edit-search', index, true);
  };

  // Validation rules
  const rules: AbstractRules = {};

  // Form
  const groups: AbstractGroups<PageConfigurerModel> = [
    {
      group: 'Search field',
      items: [
        {
          title: 'Title width',
          name: 'searchOptions.searchLabelWidth',
          extra: 'Controls the search form title width',
          render: <InputNumber />,
        },
        {
          title: 'Forms per row',
          name: 'searchOptions.span',
          extra: 'Set how many forms fit in a row',
          initialValue: 8,
          render: <InputNumber min={1} max={24} />,
        },
        {
          title: 'Display count',
          name: 'searchOptions.defaultCount',
          extra: 'When the value is greater than 0, collapse/expand is enabled',
          render: <InputNumber />,
        },
        {
          title: 'Row spacing',
          name: 'searchLineGap',
          render: <InputNumber />,
        },
        {
          title: '',
          name: 'searchFields',
          render: (
            <XSortableList
              onEdit={onEdit}
              onAdd={() => props.enterAction('add-search', undefined, true)}
              deleteConfirm="Are you sure you want toDeletethis search criterion?"
              titleRender={(item) => `${item.title || ''} - ${item.name}`}
            />
          ),
        },
      ],
    },
    {
      group: 'Search API',
      items: [
        {
          title: 'Search API',
          name: 'queryApi',
          render: (
            <SelectApi
              responseDemo={responseDemo}
              modalTitle="Choose the list query API"
            />
          ),
        },
        {
          title: 'Auto refresh',
          name: 'refresh',
          render: (<AdvancePicker allowClear data={REFRESH_MODE} />),
        },
        {
          title: 'Refresh interval',
          name: 'refreshTimeout',
          visible: (r) => r.refresh == 'timeout',
          render: (<InputNumber min={10} addonAfter="seconds" />),
        },
        {
          title: 'Keep page number',
          name: 'refreshKeepPage',
          initialValue: true,
          extra: 'Whether to keep the page number on auto refresh',
          visible: (r) => r.refresh == 'timeout' || r.refresh === 'both',
          render: <Switch />,
        },
      ],
    },
    {
      group: 'Search button',
      items: [
        { title: 'Button size', name: 'searchOptions.btnQuery.size', initialValue: 'middle', render: <Pickers.SizePicker /> },
        { title: 'Query text', name: 'searchOptions.btnQuery.title', initialValue: 'Query' },
        { title: 'Query icon', name: 'searchOptions.btnQuery.icon', extra: 'Query button icon', render: <AppIconPicker /> },
        { title: 'Clear text', name: 'searchOptions.btnCancel.title', initialValue: 'Clear' },
        { title: 'Clear icon', name: 'searchOptions.btnCancel.icon', extra: 'Clear button icon', render: <AppIconPicker /> },
        { title: 'Button shape', name: 'searchOptions.btnQuery.shape', initialValue: 'default', render: <Pickers.ShapePicker /> },
        { title: 'Show query', name: 'searchOptions.btnQuery.visible', initialValue: true, render: <Switch /> },
        { title: 'Show clear', name: 'searchOptions.btnCancel.visible', initialValue: true, render: <Switch /> },
        { title: 'Wrap display', name: 'searchOptions.isNewLine', render: <Switch /> },
        { title: 'Search on Enter', name: 'searchOptions.enterKeySubmit', initialValue: true, render: <Switch /> },
        {
          title: 'Button position',
          name: 'searchOptions.buttonFlow',
          render: <Pickers.AlignPicker />,
          visible: (r)=>r.searchOptions.isNewLine,
        },
      ],
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider value={{ autoCompletions }}>
      <AbstractForm
        defaultActiveIndex={activeIndex}
        groupStyle="tabs"
        rules={rules}
        groups={groups}
      />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
