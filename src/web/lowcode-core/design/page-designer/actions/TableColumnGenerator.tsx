import React, { useContext, useMemo, useState } from 'react';
import { AbstractTableInput } from 'lowcode-blocks';
import { Input, Button, Alert } from 'lowcode-kit';
import type { AbstractEColumns, RecordViewProps } from 'lowcode-blocks/src/interface';
import LowcodeDesigner, { type PageNodeContextValue } from '../../lowcode-designer';

export interface TableColumnGeneratorProps extends RecordViewProps<any, PageConfigurerModel> {
  config: PageConfigurerModel;
  onSubmit: (values: any) => void;
}

export interface ColumnModel {
  name: string;
  title: string;
}

const useApiModel = () => {
  const context = useContext<PageNodeContextValue>(LowcodeDesigner.NodeContext);
  const options = context.options;
  return useMemo<ColumnModel[]>(() => {
    const metaColumns = context.data?.columns || [];
    const model = (options.allRecords?.models || [])[0] || {};
    const columnKeys = Object.keys(model).filter((name) => !metaColumns.find((c) => c.name == name));
    return columnKeys.map((name) => {
      return {
        name,
        title: '',
      };
    }).sort((a, b)=> a.name > b.name ? 1 : -1 );
  }, [options.allRecords, context.data?.columns]);
};

export default function TableColumnGenerator(props: TableColumnGeneratorProps) {
  const data = useApiModel();
  const [initialValue] = useState([...data]);
  const [value, setValue] = useState(data);
  const hasData = initialValue?.length > 0;

  const columns: AbstractEColumns<ColumnModel> = [
    {
      title: 'Property name',
      name: 'name',
      width: 100,
      editor: hasData ? undefined : () => <Input />,
    },
    {
      title: 'Column name',
      name: 'title',
      width: 160,
      editor: () => <Input />,
    },
  ];

  const handleSubmit = () => {
    const rows = hasData ? data : value;
    const selected = rows?.filter((i) => i.title);
    props.onSubmit(selected);
  };


  return (
    <div>
      <Alert
        style={{ marginBottom: 10 }}
        type="info" showIcon
        message="Quickly generate columns"
        description={(
          <div>
            Enter the column-name properties; on save they become table columns
          </div>
        )}
      />
      <AbstractTableInput
        addVisible={() => !hasData}
        columns={columns}
        hideOperation={hasData}
        value={value}
        scroll={{ y: 500 }}
        onChange={setValue}
        rowKey="name"
      />
      <div style={{ textAlign: 'right', marginTop: 30 }}>
        <Button onClick={handleSubmit} variant="primary">
          Done choosing
        </Button>
      </div>
    </div>
  );
}
