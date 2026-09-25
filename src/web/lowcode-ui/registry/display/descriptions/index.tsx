import React, { useMemo } from 'react';
import { Descriptions, type DescriptionsProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import dispatcher from 'lowcode-core/runtime/dispatcher';

export type Mapping = {
  label: string
  value: string
  span: number
}

export interface RuntimeProps extends Omit<DescriptionsProps, 'items'> {
  value: Record<string, any>
  mappings: Mapping[]
  vertical: boolean
}

const useJson = (content: Record<string, any>) => {
  return useMemo(() => {
    try {
      const isString = typeof content == 'string';
      return isString ? JSON.parse(content || '{}') : content;
    } catch (ex) {
      return {};
    }
  }, [content]);
};

const useMappings = (content: Record<string, any>, mappings: Mapping[]) => {
  content = content || {};
  return mappings || Object.keys(content).map((item) => ({
    label: item,
    value: item,
    span: undefined,
  }));
};

const renderValue = (key: string, value: Record<string, any>) => {
  if (/{/.test(key)) {
    return dispatcher.fn.format(key, value);
  }
  return value[key];
};

export function DescriptionsRuntime(props: RuntimeProps) {
  const value = useJson(props.value);
  const items = useMappings(value, props.mappings);
  if (!value) return null;
  return (
    <Descriptions
      title={props.title}
      bordered={props.bordered}
      colon={props.colon}
      size={props.size}
      column={props.column}
      style={props.style}
      layout={props.vertical ? 'vertical' : 'horizontal'}
      items={items.map((item, i) => ({ key: i, label: item.label, span: item.span, children: renderValue(item.value, value) }))}
    />
  );
}

export default component.runtime('descriptions', { type: 'display', valueType: 'json-object|json-string' })(
  DescriptionsRuntime,
);
