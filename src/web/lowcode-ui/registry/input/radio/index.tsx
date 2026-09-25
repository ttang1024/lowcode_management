import React, { useMemo, useCallback } from 'react';
import { Radio, type RadioGroupProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { dispatcher } from 'lowcode-core';
import ApiWrapper from '../../../src/api-wrapper';

export interface RuntimeProps extends Omit<RadioGroupProps, 'api' | 'formatLabel'> {
  // Value field name
  valueName: string
  // Display field
  labelName: string
  // Data
  data: Record<string, any>[]
  formatLabel: string
}

export function RadioGroupRuntime({ valueName, labelName, data, formatLabel, ...props }: RuntimeProps) {
  const format = useCallback((row) => {
    return <span>{dispatcher.fn.format(formatLabel, row)}</span>;
  }, [formatLabel]);

  const options = useMemo(() => {
    const elements = (data instanceof Array ? data : [data]).filter(Boolean);
    return elements?.map((item) => {
      return {
        value: (item[valueName] || '').toString(),
        label: formatLabel ? format(item) : item[labelName],
      };
    });
  }, [data, valueName, labelName]);

  return (
    <Radio.Group
      {...props}
      options={options}
      value={props.value?.toString()}
    />
  );
}

export default component.runtime('radio', { type: 'input', valueType: 'any' })(
  ApiWrapper.create('data', RadioGroupRuntime),
);
