import React, { useMemo } from 'react';
import { Checkbox, type CheckboxGroupProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ApiWrapper from '../../../src/api-wrapper';

export interface RuntimeProps extends CheckboxGroupProps {
  // Value field name
  valueName: string
  // Display field
  labelName: string
  // Data
  data: Record<string, any>[]
}

export function CheckboxRuntime({ valueName, labelName, data, ...props }: RuntimeProps) {
  const options = useMemo(() => {
    const elements = (data instanceof Array ? data : [data]).filter(Boolean);
    return elements?.map((item) => {
      return {
        value: item[valueName] || '',
        label: item[labelName],
      };
    });
  }, [data, valueName, labelName]);

  return (
    <Checkbox.Group
      options={options}
      {...props}
    />
  );
}

export default component.runtime('checkbox', { type: 'input', valueType: '(string|number|boolen)[]' })(
  ApiWrapper.create('data', CheckboxRuntime),
);
