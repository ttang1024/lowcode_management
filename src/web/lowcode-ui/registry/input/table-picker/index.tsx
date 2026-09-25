import React, { useMemo } from 'react';
import { component } from 'lowcode-registry';
import { AbstractTablePicker } from 'lowcode-blocks';
import type { ObjectPickerProps } from 'lowcode-blocks/src/abstract-table-picker/picker';
import type { AbstractQueryType } from 'lowcode-blocks/src/interface';
import dispatcher from 'lowcode-core/runtime/dispatcher';

export interface ConfigItem {
  title: string
  name: string
}

export interface RuntimeProps extends ObjectPickerProps<any> {
  api: ApiConfigurerModel
}

export function TablePickerRuntime(props: RuntimeProps) {
  const onQuery = async(query: AbstractQueryType) => {
    delete query['@@mode'];
    query.pageIndex = query.pageNo;
    delete query.pageNo;
    const response = await dispatcher.api.callApi<any>(props.api, query, {}, query);
    return {
      count: response?.result?.count,
      models: response?.result?.models || [],
    };
  };

  const value = useMemo(() => {
    return props.value instanceof Array ? props.value : [props.value].filter(Boolean);
  }, [props.value]);

  return (
    <AbstractTablePicker
      {...props}
      value={value}
      paramMode="mix"
      onQuery={onQuery}
    />
  );
}

export default component.runtime('table-picker', { type: 'input', valueType: 'object[]' })(TablePickerRuntime);
