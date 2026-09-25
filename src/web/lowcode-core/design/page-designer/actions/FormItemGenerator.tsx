import React, { useContext, useMemo, useState } from 'react';
import { AbstractForm, AbstractTableInput } from 'lowcode-blocks';
import { Input, Alert } from 'lowcode-kit';
import type { AbstractEColumns, AbstractGroups, RecordViewProps } from 'lowcode-blocks/src/interface';
import LowcodeDesigner, { type PageNodeContextValue } from '../../lowcode-designer';

export interface FormItemGeneratorProps extends RecordViewProps<any, PageConfigurerModel> {
  config: PageConfigurerModel;
}

export interface FormItemGeneratorModel {
  items:FormItemModel[]
}

const useApiModel = () => {
  const context = useContext<PageNodeContextValue>(LowcodeDesigner.NodeContext);
  const options = context.options;
  return useMemo<FormItemModel[]>(() => {
    const formView = context.options?.actionView;
    const metaGroups = formView.groups || [];
    const model = options.record || {};
    const itemKeys = Object.keys(model).filter((name) => !metaGroups.find((c) => c.name == name));
    return itemKeys.map((name) => {
      return {
        name,
        title: '',
      };
    }).sort((a, b)=> a.name > b.name ? 1 : -1 );
  }, [options.record]);
};

export default function FormItemGenerator() {
  const data = useApiModel();
  const [value, setValue] = useState(data);

  const columns: AbstractEColumns<FormItemModel> = [
    { title: 'Property name', name: 'name', width: 100 },
    {
      title: 'Title',
      name: 'title',
      width: 160,
      editor: () => <Input />,
    },
  ];

  const groups:AbstractGroups<FormItemGeneratorModel> = [
    {
      title: '',
      name: 'items',
      initialValue: value,
      render: (
        <AbstractTableInput
          addVisible={() => false}
          columns={columns}
          hideOperation
          scroll={{ y: 500 }}
          onChange={setValue}
          rowKey="name"
        />
      ),
    },
  ];

  return (
    <div style={{ minHeight: 500 }}>
      <Alert
        style={{ marginBottom: 10 }}
        type="info" showIcon
        message="Quickly generate forms"
        description={(
          <div>
            Enter the title properties; on save they become the view form items.
          </div>
        )}
      />
      <AbstractForm groups={groups} />
    </div>
  );
}
