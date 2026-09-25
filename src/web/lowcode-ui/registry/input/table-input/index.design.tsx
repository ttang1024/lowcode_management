import React, { useMemo } from 'react';
import Runtime from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AbstractTableInput, RadioList } from 'lowcode-blocks';
import { Button, Input, Switch } from 'lowcode-kit';
import type { TableInputRuntimeProps } from './index';
import type { AutoCompletion } from '../../../src/code-editor';
import type { AbstractEColumns, AbstractRules } from 'lowcode-blocks/src/interface';
import ControlInput from './components/ControlInput';
import InputNumber from '../input-number';
import AppIconPicker from '../../../src/app-icon-picker';
import Pickers from '../../../src/pickers';
import { COLUMN_FIXED } from 'lowcode-configs/constants';
import SelectApi, { type ApiConfigurerProps } from '../../../src/select-api';
import EventPicker from '../../../src/event-picker';

export interface ConfigItem {
  title: string
  name: string
  width: number
}

const apiResponse = {};

interface ContextSelectApiProps extends Pick<ApiConfigurerProps, 'onChange' | 'value'> {
  columns: TableInputRuntimeProps['columns']
}

const ContextSelectApi = (props: ContextSelectApiProps) => {
  const contextParams = useMemo(() => {
    return (props.columns || []).map((column) => {
      return {
        meta: column.title,
        value: column.name,
      };
    }) as AutoCompletion[];
  }, [props.columns]);

  return (
    <SelectApi
      value={props.value}
      onChange={props.onChange}
      shared={false}
      contextParams={contextParams}
      responseDemo={{}}
    />
  );
};

function TableInputDesigner() {
  const rules: AbstractRules = {
    rowKey: [{ required: true, message: 'Please set the table primary key' }],
  };

  const columns: AbstractEColumns<ConfigItem> = [
    { title: 'Title', width: 120, name: 'title', editor: () => <Input size="small" /> },
    { title: 'Property', width: 120, name: 'name', editor: () => <Input size="small" /> },
    { title: 'Width', width: 120, name: 'width', editor: () => <InputNumber size="small" min={30} /> },
    { title: 'Input component', width: 80, name: 'control', editor: () => <ControlInput /> },
  ];


  const groups: AbstractGroups<TableInputRuntimeProps> = [
    {
      title: 'Primary key',
      name: 'rowKey',
      initialValue: 'id',
      render: <Input />,
    },
    {
      group: 'Column config',
      items: [
        {
          title: '',
          name: 'columns',
          render: (
            <AbstractTableInput
              size="small"
              addButton={<Button size="sm">Add a column</Button>}
              scroll={{ x: 380 }}
              operation={{ width: 60 }}
              columns={columns}
            />
          ),
        },
      ],
    },
    {
      group: 'Basic config',
      items: [
        {
          title: 'Edit mode',
          name: 'mode',
          initialValue: 'all',
          render: <Pickers.TableInputModePicker />,
        },
        {
          title: 'Save API',
          name: 'saveApi',
          visible: (r) => r.mode == 'row',
          render: (r) => <ContextSelectApi columns={r.columns} />,
        },
        {
          title: 'DeleteAPI',
          name: 'removeApi',
          visible: (r) => r.mode == 'row',
          render: (r) => <ContextSelectApi columns={r.columns} />,
        },
        {
          title: 'Action width',
          name: 'operation.width',
          render: <InputNumber />,
        },
        {
          title: 'Action sticky',
          name: 'operation.fixed',
          render: <RadioList size="small" options={COLUMN_FIXED} />,
        },
        {
          title: 'Movable rows',
          name: 'moveable',
          render: <Switch />,
        },
        {
          title: 'DeleteText',
          name: 'removeConfirm',
          initialValue: 'Are you sure you want to delete this row?',
          extra: 'Prompt text shown when deleting a row',
          render: <Input />,
        },
        {
          title: 'Cancel text',
          name: 'cancelConfirm',
          visible: (r) => r.mode == 'row',
          extra: 'Confirmation text shown when cancelling editing',
          render: <Input />,
        },
        {
          title: 'Action column',
          name: 'showOperation',
          extra: 'Whether to show the action column',
          initialValue: true,
          render: <Switch />,
        },
        {
          title: 'DeleteButton',
          name: 'removeVisible',
          initialValue: true,
          extra: 'Whether to showDeleteButton',
          render: <Switch />,
        },
        {
          title: 'Add button',
          name: 'addVisible',
          initialValue: true,
          extra: 'Whether to show the add button',
          render: <Switch />,
        },

      ],
    },
    {
      group: 'Add button',
      visible: (r) => r.addVisible !== false,
      items: [
        {
          title: 'Button text',
          name: 'addBtn.text',
          initialValue: 'Append a row',
          render: <Input />,
        },
        {
          title: 'Button icon',
          name: 'addBtn.icon',
          render: <AppIconPicker />,
        },
        {
          title: 'Button shape',
          name: 'addBtn.shape',
          initialValue: 'default',
          render: <Pickers.ShapePicker />,
        },
        {
          title: 'Button size',
          name: 'addBtn.size',
          initialValue: 'middle',
          render: <Pickers.SizePicker />,
        },
        {
          title: 'Button type',
          name: 'addBtn.type',
          initialValue: '',
          render: <Pickers.ButtonTypePicker />,
        },
        {
          title: 'Add event',
          name: 'addBtn.event',
          render2: <EventPicker autoSync apiResponse={apiResponse} />,
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

export default component.design(Runtime)(TableInputDesigner);
