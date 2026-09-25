import React, { useMemo } from 'react';
import { Transfer, type TransferProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ApiWrapper from '../../../src/api-wrapper';
import { format } from '../../utils';

interface NodeOption {
  key: string
  title: string
  [x: string]: any
}

export type RuntimeProps = TransferProps<NodeOption> & {
  value: string[]
  onChange?: (value: string[]) => void
  width: number
  height: number
  left: string
  right: string
  leftTitle: string
  rightTitle: string
  valueName: string
  template: string
  data: NodeOption[]
  mode: 'default' | 'tree' | 'table'
}

export function TransferRuntime({
  width,
  rightTitle,
  leftTitle,
  template,
  valueName,
  value,
  height,
  left = '',
  right = '',
  onChange,
  ...others
}: RuntimeProps) {
  const dataSource = useMemo(() => {
    return others.dataSource?.map((item) => ({ key: item[valueName], ...item }));
  }, [others.dataSource, valueName]);

  const targetKeys = (value instanceof Array ? value : [value]).filter((v) => v !== undefined && v !== null);

  return (
    <Transfer
      showSearch={others.showSearch}
      disabled={others.disabled}
      targetKeys={targetKeys}
      onChange={(keys) => onChange?.(keys)}
      listStyle={{ width, height }}
      operations={[left, right]}
      titles={[leftTitle, rightTitle]}
      render={(item: NodeOption) => format(template || '', item)}
      dataSource={dataSource || []}
    />
  );
}

export default component.runtime('transfer', { type: 'input', valueType: 'string[]' })(
  ApiWrapper.create('dataSource', TransferRuntime, []),
);
