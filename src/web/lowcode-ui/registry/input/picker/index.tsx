import React, { useCallback } from 'react';
import { component } from 'lowcode-registry';
import { useFetchApiSource } from '../../../src/api-wrapper';
import { AdvancePicker } from 'lowcode-blocks';
import type { AdvancePickerProps } from 'lowcode-blocks/src/advance-picker';
import { dispatcher } from 'lowcode-core';

export interface RuntimeProps extends Omit<AdvancePickerProps<any, any>, 'api'| 'formatLabel'> {
  api: ApiWrapperOptions
  formatLabel: string
}

export function AdvancePickerRuntime({ api, formatLabel, ...props }: RuntimeProps) {
  const source = useFetchApiSource(api);
  const len = api?.api?.values?.requestFormatFunction?.length;
  const len2 = api?.api?.values?.responseFormatFunction?.length;
  const id = [props.labelName, props.valueName, len, len2, api?.type, api?.optionsKey, api?.api?.meta?.name].join('-');

  const format = useCallback((row)=>{
    return <span>{dispatcher.fn.format(formatLabel, row.original)}</span>;
  }, [formatLabel]);

  return (
    <AdvancePicker
      {...props}
      key={id}
      formatLabel={formatLabel ? format : undefined}
      api={source.refresh}
      optionLabelProp="label"
    />
  );
}

export default component.runtime('picker', { type: 'input', valueType: 'any' })(
  AdvancePickerRuntime,
);
