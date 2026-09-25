import React from 'react';
import { InputNumber } from 'lowcode-kit';
import { AbstractForm, RadioList } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import XSortableList from '../components/x-sortable-list';
import { FORM_GROUP_STYLE, TABS_STYLE, TABS_POSITION } from 'lowcode-configs/constants';
import type { EnterAction } from './types';

export interface FormConfigurerProps extends RecordViewProps<ViewConfigurerModel, PageConfigurerModel> {
  config: PageConfigurerModel
  enterAction: EnterAction
}

export default function FormConfigurer(props: FormConfigurerProps) {
  const type = props.record.type;
  const onEdit = (item: FormItemModel, index: number) => {
    if ('group' in item) {
      props.enterAction('edit-group', index, true);
    } else {
      if (type === 'sub-view') {
        props.enterAction('edit-sub-form', index, true);
      } else {
        props.enterAction('edit-form', index, true);
      }
    }
  };

  const onAdd = () => {
    if (type === 'sub-view') {
      props.enterAction('add-sub-form', undefined, true);
    } else {
      props.enterAction('add-form', undefined, true);
    }
  };

  // Validation rules
  const rules: AbstractRules = {};

  // Form
  const groups: AbstractGroups<ViewConfigurerModel> = [
    {
      group: 'Form order',
      items: [
        {
          title: '',
          name: 'groups',
          layout: { labelCol: { span: 24 } },
          render: (
            <XSortableList
              onEdit={onEdit}
              onAdd={onAdd}
              deleteConfirm="Are you sure you want toDeletecurrent form?"
              ribbonRender={(item) => 'group' in item ? 'Group' : ''}
              titleRender={(item) => 'group' in item ? item.group : `${item.title || ''} - ${item.name}`}
            />
          ),
        },
      ],
    },
    {
      group: 'Basic config',
      items: [
        {
          title: 'Forms per row',
          name: 'cols',
          extra: 'Set how many forms fit in a row',
          initialValue: 1,
          render: <InputNumber min={1} max={6} />,
        },
        {
          title: 'Title width',
          name: 'labelWidth',
          render: <InputNumber />,
          extra: 'Uniformly control each form item title width',
        },
        {
          title: 'Container width',
          name: 'width',
          render: <InputNumber />,
          extra: 'the width of the whole form container',
        },
        { title: 'Row spacing', name: 'lineGap', render: <InputNumber /> },
        {
          title: 'Group style',
          name: 'groupStyle',
          extra: 'only effective when there are grouped forms',
          render: <RadioList optionType="button" options={FORM_GROUP_STYLE} />,
        },
        {
          title: 'Tab style',
          name: 'tabType',
          visible: (row) => row.groupStyle == 'tabs',
          render: <RadioList optionType="button" options={TABS_STYLE} />,
        },
        {
          title: 'Tab position',
          name: 'tabPosition',
          visible: (row) => row.groupStyle == 'tabs',
          render: <RadioList optionType="button" options={TABS_POSITION} />,
        },
      ],
    },
  ];

  // Render
  return <AbstractForm groupStyle="tabs" rules={rules} groups={groups} />;
}
