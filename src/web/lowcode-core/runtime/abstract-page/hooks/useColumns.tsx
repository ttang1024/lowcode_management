import React, { useEffect, useState } from 'react';
import type { AbstractColumns } from 'lowcode-blocks';
import createComponent from './createComponent';

interface CellViewProps {
  column: TableColumnModel
  row: any
  value: any
}

const CellView = (props: CellViewProps) => {
  const item = props.column;
  const { row } = props;
  const [value, setValue] = useState<any>(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const rendered = createComponent(item.formatter, row as any, item.componentCss, {
    [item.valueName || 'value']: value,
    model: row,
    onChange: setValue,
  }, {
    type: 'table-column',
    item: item,
  });
  return (
    <div
      className={ item.ellipsis ? 'ellipsis' : undefined }
      title={item.ellipsis ? String(value || '') : undefined}
    >
      {rendered || String(value || '')}
    </div>
  );
};

export default function useColumns(columns: TableColumnModel[]) {
  const response = columns?.map((item) => {
    return {
      name: item.name,
      title: item.title,
      width: item.width,
      ellipsis: item.ellipsis,
      sort: item.sortable ? item.sort : undefined,
      fixed: item.fixed,
      render: (value, row) => {
        return <CellView value={value} row={row} column={item} />;
      },
    };
  }) as AbstractColumns;
  return response || [];
}