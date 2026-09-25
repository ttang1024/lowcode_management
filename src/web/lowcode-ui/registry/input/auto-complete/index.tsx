import React, { useMemo } from 'react';
import { AutoComplete, Input, type AutoCompleteProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { useFetchApiSource } from '../../../src/api-wrapper';
import { format } from '../../utils';

export interface RuntimeProps extends AutoCompleteProps {
  value: string
  valueKey: string
  template: string
  onChange: (value: string) => void
  search?: boolean
  api?: ApiWrapperOptions
}

export function AutoCompleteRuntime({ valueKey, template, api, search, ...props }: RuntimeProps) {
  const source = useFetchApiSource<any[]>(api);

  const handleSearch = (value: string) => {
    source.refresh({ filter: value });
  };

  const options = useMemo(() => {
    return source.response?.map((item) => {
      return {
        value: item[valueKey],
        label: format(template, item),
      };
    });
  }, [source.response]);

  return (
    <AutoComplete
      {...props}
      options={options}
      onSelect={props.onChange}
      onSearch={handleSearch}
    >
      {search ? <Input.Search enterButton onSearch={handleSearch} /> : undefined}
    </AutoComplete>
  );
}

export default component.runtime('auto-complete', { type: 'input', valueType: 'string' })(
  AutoCompleteRuntime,
);
