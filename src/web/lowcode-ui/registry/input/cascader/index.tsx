import React, { useEffect, useState } from 'react';
import { Cascader, type CascaderProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import dispatcher from 'lowcode-core/runtime/dispatcher';
import { useRouteMatch } from 'lowcode-common';
import { AbstractIcon } from 'lowcode-blocks';

interface Option {
  value: string;
  label: string;
  level: number
  children?: Option[];
  isLeaf?: boolean;
  loading?: boolean;
}

export type RuntimeProps = CascaderProps & {
  api: ApiConfigurerModel
  maxLevel?: number
  valueName?: string
  labelName?: string
}

export function ApiCascaderRuntime(props: RuntimeProps) {
  const match = useRouteMatch();
  const [options, setOptions] = useState<Option[]>([]);
  const { maxLevel = 2, valueName = 'value', labelName = 'label', api: _api, ...others } = props;
  const suffixIcon = props.suffixIcon ? <AbstractIcon type={props.suffixIcon as string} /> : undefined;

  const fetchOptions = async(targetOption: Option, level: number) => {
    const response = await dispatcher.api.callApi<ApiResponse<any[]>>(props.api, targetOption || {}, match.params, null);
    const result = response?.result;
    const elements = (result instanceof Array ? result : [result]).filter(Boolean);
    return elements.map((item) => {
      return {
        ...item,
        value: item[valueName],
        label: item[labelName],
        children: [],
        level: level,
        isLeaf: level >= maxLevel,
      } as Option;
    });
  };

  const loadData = async(selectOptions: Option[]) => {
    const targetOption = selectOptions[selectOptions.length - 1];
    if (!targetOption) return;
    const models = await fetchOptions(targetOption, targetOption.level + 1);
    targetOption.children.push(...models);
    // An option with no children turns out to be a leaf.
    if (!models.length) targetOption.isLeaf = true;
    setOptions((list) => [...list]);
  };

  useEffect(() => {
    fetchOptions({} as Option, 1).then((models) => setOptions(models));
  }, [props.api, props.labelName, props.valueName, props.maxLevel]);

  return (
    <Cascader
      {...others}
      suffixIcon={suffixIcon}
      options={options}
      loadData={loadData}
    />
  );
}

export default component.runtime('cascader', { type: 'input', valueType: 'string' })(
  ApiCascaderRuntime,
);
