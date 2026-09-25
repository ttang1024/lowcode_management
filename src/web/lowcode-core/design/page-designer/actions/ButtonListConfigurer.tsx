import React from 'react';
import { Tooltip } from 'lowcode-kit';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import XSortableList from '../components/x-sortable-list';
import type { EnterAction } from './types';

export interface ButtonListConfigurerProps extends RecordViewProps<TableButtonModel, PageConfigurerModel> {
  config: PageConfigurerModel
  enterAction: EnterAction
}

export const titleRender = (item: TableButtonModel) => {
  return (
    <div className="button-view">
      <span className="mr-1 text-sm">{item.title}</span>
      {item.event?.type == 'action' ? `(view - ${item.event.action.name})` : item.event?.type || ''}
    </div>
  );
};

const viewTitleRender = (item: ViewConfigurerModel, buttons: TableButtonModel[]) => {
  const items = buttons.filter((m) => m.event?.action?.view == item.id);
  return (
    <Tooltip
      title={(
        items.map((m, i) => <div key={i}>{m.title} - {m.event?.action?.name}</div>)
      )}
    >
      <div>{item.id} - {items.length}<span>Reference</span></div>
    </Tooltip>
  );
};

const viewDeleteAble = (item: ViewConfigurerModel, buttons: TableButtonModel[]) => {
  const items = buttons.filter((m) => m.event?.action?.view == item.id);
  return items.length !== 0;
};

export default function ButtonListConfigurer(props: ButtonListConfigurerProps) {
  const buttons = [...(props.config.buttons || [])];
  props.config?.views?.forEach((item) => {
    buttons.push(...item.buttons as any);
  });

  const onEdit = (item: TableButtonModel, index: number) => {
    props.enterAction('edit-button', index, true);
  };

  // Validation rules
  const rules: AbstractRules = {};

  // Form
  const groups: AbstractGroups<TableButtonModel> = [
    {
      group: 'Button list',
      items: [
        {
          title: '',
          name: 'buttons',
          render: (
            <XSortableList
              onEdit={onEdit}
              onAdd={() => props.enterAction('add-button', undefined, true)}
              deleteConfirm="Are you sure you want toDeletethis button? "
              titleRender={titleRender}
            />
          ),
        },
      ],
    },
    {
      group: 'View management',
      items: [
        {
          title: '',
          name: 'views',
          render: (
            <XSortableList<ViewConfigurerModel>
              deleteConfirm="Are you sure you want to delete this view"
              titleRender={(item) => viewTitleRender(item, buttons)}
              hideDelete={(item)=> viewDeleteAble(item, buttons)}
            />
          ),

        },
      ],
    },
  ];

  // Render
  return <AbstractForm groupStyle="tabs" rules={rules} groups={groups} />;
}
