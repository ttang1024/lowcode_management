import React, { useMemo } from 'react';
import { component } from 'lowcode-registry';
import { XlsxPicker } from 'lowcode-blocks';
import type { XlsxPickerProps } from 'lowcode-blocks/src/xlsx-picker';

export interface Mapping {
  label: string
  key: string
}

export type RuntimeProps = Omit<XlsxPickerProps, 'mappings'> & {
  max: string
  min: string
  mappings: Mapping[]
}

export function XlsxPickerRuntime(props: RuntimeProps) {
  const { mappings, ...others } = props;
  const useMappings = useMemo(()=>{
    const useMappings = {} as any;
    mappings?.forEach((n) => {
      useMappings[n.label] = {
        name: n.key,
        format: null,
      };
    });
    return [useMappings];
  }, [mappings]);


  return <XlsxPicker mappings={useMappings} {...others} />;
}

export default component.runtime('xlsx-picker', { type: 'input' })(
  XlsxPickerRuntime,
);
