import React from 'react';
import { Switch } from 'lowcode-kit';
import type { AbstractGroups, RecordViewProps } from 'lowcode-blocks/src/interface';
import { EventPicker, Pickers, ColorPicker } from 'lowcode-ui';
import { ButtonConfigurerForm, createAvariableItem, createButtonStyleItems } from './ButtonConfigurerShared';

export interface FormButtonConfigurerProps extends RecordViewProps<TableButtonModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

export default function FormButtonConfigurer(props: FormButtonConfigurerProps) {
  const record = props.record;

  // Form
  const groups: AbstractGroups<FormButtonModel> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Name', name: 'title' },
        { title: 'Position', name: 'target', initialValue: 'footer', render: <Pickers.FormButtonTargetPicker /> },
        ...createButtonStyleItems<FormButtonModel>(),
        { title: 'Button color', name: 'backgroundColor', render: <ColorPicker /> },
        { title: 'Text color', name: 'color', render: <ColorPicker /> },
        {
          title: 'Validate the form',
          name: 'needValidate',
          extra: 'When enabled, the event runs only after the form is fully filled in',
          initialValue: '', render: <Switch />,
        },
        createAvariableItem<FormButtonModel>('function avariable(model) {'),
      ],
    },
    {
      group: 'Event config',
      items: [
        {
          title: 'Event type',
          name: 'event',
          render2: (
            <EventPicker
              withBack
              apiResponse={{}}
              currentAction={record?.event?.action?.name}
            />
          ),
        },
      ],
    },
  ];

  // Render
  return <ButtonConfigurerForm scenario="form" groups={groups} />;
}
