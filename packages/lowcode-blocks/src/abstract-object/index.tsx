/**
 * @module abstract-object
 * @description Read-only record view rendered from a groups/columns config.
 */
import React from 'react';
import { DescriptionList } from 'lowcode-kit';
import type { RecordViewProps, AbstractFormItemType } from '../interface';

function flattenItems(props: RecordViewProps): AbstractFormItemType[] {
  const items: AbstractFormItemType[] = [];
  (props.groups || props.config?.groups || []).forEach((node: any) => {
    if (Array.isArray(node.items)) items.push(...node.items);
    else items.push(node);
  });
  return items;
}

const AbstractObject: React.FC<RecordViewProps> = (props) => {
  const record: any = props.value || props.record || {};
  const items = flattenItems(props);
  return (
    <DescriptionList
      items={items.map((item) => {
        const name = Array.isArray(item.name) ? item.name.join('.') : item.name;
        const value = name ? record[name as string] : undefined;
        const content = typeof item.render === 'function' ? item.render(value, record) : (value as React.ReactNode);
        return { key: String(name), label: item.title ?? item.label, value: content as React.ReactNode };
      })}
    />
  );
};

export default AbstractObject;
