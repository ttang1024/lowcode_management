import React, { useContext, useMemo } from 'react';
import { TreeSelect, type TreeSelectProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ApiWrapper, { ApiWrapperUIContext } from '../../../src/api-wrapper';

export interface RuntimeProps extends TreeSelectProps {
  // Parent id field
  parentKey: string
  // Value field name
  valueKey: string
  // Display field
  labelKey: string
  // Data
  data: Record<string, any>[]
}

export function TreeSelectRuntime({ parentKey, valueKey, labelKey, data, ...props }: RuntimeProps) {
  const treeData = useMemo(() => {
    const elements = (data instanceof Array ? data : [data]).filter(Boolean);
    return elements?.map((item) => {
      return {
        id: item[valueKey],
        pId: item[parentKey],
        value: item[valueKey],
        title: item[labelKey],
      };
    });
  }, [data, parentKey, valueKey, labelKey]);

  const uiContext = useContext(ApiWrapperUIContext);

  return (
    <TreeSelect
      treeDataSimpleMode
      treeData={treeData || []}
      {...props}
      loading={uiContext.loading}
    />
  );
}

export default component.runtime('treeselect', { type: 'input', valueType: 'any' })(
  ApiWrapper.create('data', TreeSelectRuntime),
);
