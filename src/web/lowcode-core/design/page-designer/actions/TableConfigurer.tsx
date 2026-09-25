import React from 'react';
import { InputNumber, Switch } from 'lowcode-kit';
import { AbstractForm, AdvancePicker, RadioList } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import XSortableList from '../components/x-sortable-list';
import type { EnterAction } from './types';
import FilterTabsInput from '../components/filter-tabs-input';
import { COLUMN_FIXED, TABLE_SIZE } from 'lowcode-configs/constants';

export interface TableConfigurerProps extends RecordViewProps<TableColumnModel, PageConfigurerModel> {
  config: PageConfigurerModel
  enterAction: EnterAction
}

export default function TableConfigurer(props: TableConfigurerProps) {
  const onEdit = (item: TableColumnModel, index: number) => {
    props.enterAction('edit-column', index, true);
  };

  // Validation rules
  const rules: AbstractRules = {};

  // Form
  const groups: AbstractGroups<PageConfigurerModel> = [
    {
      group: 'All columns',
      items: [
        {
          title: 'Primary key',
          initialValue: 'id',
          name: 'idKey',
        },
        {
          title: '',
          name: 'columns',
          render: (
            <XSortableList
              onEdit={onEdit}
              onAdd={() => props.enterAction('add-column', undefined, true)}
              deleteConfirm="Are you sure you want toDeletethis column?"
              titleRender={(item) => `${item.title} - ${item.name}`}
            />
          ),
        },
      ],
    },
    {
      group: 'Table tag',
      items: [
        { title: 'Field name', name: 'filter.name', extra: 'the field name used for querying' },
        {
          title: 'Selected by default',
          name: 'filter.active',
          render: (row) => {
            const items = ((row.filter as any)?.tabs || []) as any[];
            return <AdvancePicker data={items} />;
          },
        },
        {
          title: '',
          name: 'filter.tabs',
          render: (
            <FilterTabsInput />
          ),
        },
      ],
    },
    {
      group: 'Table props',
      items: [
        { title: 'Action column width', name: 'tableOptions.operation.width', render: <InputNumber /> },
        { title: 'Action column width', name: 'tableOptions.operation.fixed', initialValue: 'right', render: <RadioList size="small" options={COLUMN_FIXED} /> },
        { title: 'Sort field', name: 'tableOptions.sort', extra: 'Default sort field' },
        { title: 'Sort type', name: 'tableOptions.order', extra: 'Default sort type' },
        { title: 'Default column width', name: 'tableOptions.cellWidth', extra: 'lower priority than the column width config', render: <InputNumber /> },
        { title: 'Query by default', name: 'tableOptions.initQuery', initialValue: true, render: <Switch />, extra: 'When closed, data is not queried by default; click the query button to query' },
        { title: 'Table size', name: 'tableOptions.size', initialValue: 'default', render: <RadioList size="small" options={TABLE_SIZE} /> },
        { title: 'Auto height', name: 'tableOptions.autoHeight', render: <Switch /> },
      ],
    },
  ];

  // Render
  return <AbstractForm groupStyle="tabs" rules={rules} groups={groups} />;
}
