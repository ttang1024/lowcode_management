import React from 'react';
import { Switch } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { AppIconPicker, Pickers } from 'lowcode-ui';
import XSortableList from '../components/x-sortable-list';
import type { EnterAction } from './types';
import { titleRender } from './ButtonListConfigurer';

export interface FormButtonListConfigurerProps extends RecordViewProps<TableButtonModel, PageConfigurerModel> {
  config: PageConfigurerModel
  enterAction: EnterAction
}


export default function FormButtonListConfigurer(props: FormButtonListConfigurerProps) {
  const onEdit = (item: TableButtonModel, index: number) => {
    props.enterAction('edit-form-button', index, true);
  };

  // Validation rules
  const rules: AbstractRules = {
    api: [{ required: true, message: 'Please configure the submit API' }],
  };

  // Form
  const groups: AbstractGroups<ViewConfigurerModel> = [
    {
      group: 'Button list',
      items: [
        {
          title: '',
          name: 'buttons',
          render: (
            <XSortableList
              onEdit={onEdit}
              onAdd={() => props.enterAction('add-form-button', undefined, true)}
              deleteConfirm="Are you sure you want toDeletethis button? "
              titleRender={titleRender}
            />
          ),
        },
      ],
    },
    {
      group: 'Basic button',
      items: [
        { title: 'Confirmation text', name: 'btnSubmit.title', initialValue: 'Confirm' },
        { title: 'Query icon', name: 'btnSubmit.icon', extra: 'Confirm button icon', render: <AppIconPicker /> },
        { title: 'Cancel text', name: 'btnCancel.title', initialValue: 'Return' },
        { title: 'Cancel icon', name: 'btnCancel.icon', extra: 'Cancel button icon', render: <AppIconPicker /> },
        { title: 'Button shape', name: 'btnSubmit.shape', initialValue: 'default', render: <Pickers.ShapePicker /> },
        { title: 'Button size', name: 'btnSubmit.size', initialValue: 'middle', render: <Pickers.SizePicker /> },
        {
          title: 'Hide cancel',
          name: 'btnCancel.hidden',
          render: <Switch />,
          extra: 'When enabled, the cancel button is hidden',
        },
        {
          title: 'Hide confirm',
          name: 'btnSubmit.hidden',
          render: <Switch />,
          extra: 'When enabled, the confirm button is hidden',
        },
      ],
    },
  ];

  // Render
  return <AbstractForm groupStyle="tabs" rules={rules} groups={groups} />;
}
