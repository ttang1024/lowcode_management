import React from 'react';
import { Input } from 'lowcode-kit';
import type { AbstractGroups, RecordViewProps } from 'lowcode-blocks/src/interface';
import { COMPLETIONS } from 'lowcode-configs/constants';
import { EventPicker, Pickers } from 'lowcode-ui';
import { ButtonConfigurerForm, createAvariableItem, createButtonStyleItems } from './ButtonConfigurerShared';

const apiResponseDemo = {};

export interface ButtonConfigurerProps extends RecordViewProps<TableButtonModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

export default function ButtonConfigurer(props: ButtonConfigurerProps) {
  const record = props.record;

  // Form
  const groups: AbstractGroups<TableButtonModel> = [
    {
      group: 'Basic config',
      items: [
        { title: 'Name', name: 'title' },
        { title: 'Position', name: 'target', initialValue: 'top', render: <Pickers.ButtonTargetPicker /> },
        { title: 'Selection mode', name: 'select', initialValue: '', render: <Pickers.ButtonSelectModePicker /> },
        ...createButtonStyleItems<TableButtonModel>(),
        { title: 'Tooltip content', name: 'tip', extra: 'Content shown when hovering over the button', render: <Input.TextArea showCount maxLength={100} rows={3} /> },
        createAvariableItem<TableButtonModel>('function avariable(model,route) {', COMPLETIONS.buttonCompletions),
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
              apiResponse={apiResponseDemo}
              currentAction={record?.event?.action?.name}
            />
          ),
        },
      ],
    },
  ];

  // Render
  return <ButtonConfigurerForm scenario="table" groups={groups} />;
}
