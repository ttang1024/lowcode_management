import React from 'react';
import { type AbstractGroups, AbstractIcon } from 'lowcode-blocks';
import type { AbstractFormGroupItemType, AbstractFormItemType, AbstractValueConverter } from 'lowcode-blocks/src/interface';
import dispatcher from '../../dispatcher';
import type { AbstractViewProps } from '../actions/AbstractView';
import createComponent, { createAvariable } from './createComponent';
import { component } from 'lowcode-registry';

function createExtraFn(fn: string, record) {
  // eslint-disable-next-line react/display-name
  return (row: any) => {
    const extraFn = dispatcher.fn.create<{ content: string, css: React.CSSProperties }>(fn, ['value', 'model']);
    const res = extraFn ? extraFn(record, row) : null;
    if (!res?.content) {
      return null;
    }
    return (
      <div style={res?.css}>{String(res?.content || '')}</div>
    );
  };
}

interface Converter {
  getValue: (v: any) => any
  setValue: (v: any) => any
}

function createConverter(config: FormItemModel['convert']): AbstractValueConverter {
  if (!config?.name) {
    // if not configuredconverter
    return undefined;
  }
  switch (config.name) {
    case 'custom':
      const creator = dispatcher.fn.create<Converter>(config.options?.fn);
      const value = creator?.();
      if (!value?.getValue || !value?.setValue) return undefined;
      return [config.name, value];
    default:
      return [config.name, config.options];
  }
}

function createGroupItem(item: FormItemModel, props: AbstractViewProps): AbstractFormItemType<any> {
  const router = dispatcher.router;
  const avariable = createAvariable<ButtonAvariableInfo>(item.avariable, ['model', 'props', 'route']);
  const key = item.component?.key?.trim();
  const converter = createConverter(item.convert);
  const create = (data) => createComponent(item.component, data, item.componentCss, { converter: converter }, {
    type: 'createGroupItem',
    item: item,
  });
  const extra = item.extraFn ? createExtraFn(item.extraFn, props.record) : undefined;
  const titleStyle = { ...(item.titleCss || {}) };
  const layout = item.labelWidth > 0 ? createLayout(item.labelWidth) : undefined;

  return {
    name: item.name,
    title: item.title ? <span style={titleStyle}>{item.title}</span> : null,
    span: item.span,
    offset: item.offset,
    break: item.break,
    // `extra` may be a dynamic render fn (createExtraFn) resolved downstream.
    extra: (extra || item.extra) as any,
    colon: item.colon,
    initialValue: item.initialValue,
    hasFeedback: item.hasFeedback,
    textonly: item.textonly,
    placeholder: item.placeholder,
    layout: item.titleBreak ? { labelCol: { span: 24 } } : layout,
    convert: converter,
    className: component.getRegistration(item.component?.name)?.type == 'display' ? 'readonly-item' : '',
    cascade: item.cascade ? dispatcher.fn.create(item.cascade, ['value', 'model']) : undefined,
    customKey: key ? (model) => dispatcher.fn.format(key, model) : undefined,
    render: key ? create : create(props.hasSubApi ? { ...props.record, ...props.subRecord } : props.record || {}),
    visible: avariable ? (model) => avariable(model, props, router.getRoute())?.visible !== false : undefined,
    disabled: avariable ? (model) => avariable(model, props, router.getRoute())?.disabled : undefined,
  };
}

export function createLayout(width: number) {
  return {
    labelCol: {
      flex: `${width}px`,
    },
    wrapperCol: {
    },
  };
}

function createGroup(element: FormItemGroupModel, props: AbstractViewProps): AbstractFormGroupItemType<any> {
  const labelWidth = element.labelWidth;
  const router = dispatcher.router;
  const avariable = createAvariable<boolean>(element.visible, ['model', 'props', 'route']);
  const isReadOnly = createAvariable<boolean>(element.readonly, ['model', 'props', 'route']);
  return {
    group: element.group,
    span: 24 / (element.cols || 1),
    layout: labelWidth > 0 ? createLayout(labelWidth) : undefined,
    icon: element.groupIcon ? <AbstractIcon className="abstract-form-group-icon mr-3" type={element.groupIcon} /> : null,
    items: [],
    readonly: isReadOnly ? (model) => isReadOnly(model, props, router.getRoute()) : undefined,
    itemStyle: element.lineGap > 0 ? { marginBottom: element.lineGap } : undefined,
    visible: avariable ? (model) => avariable(model, props, router.getRoute()) !== false : undefined,
  };
}

export default function useFormGroups<T = any>(elements: FormItemModel[], props: AbstractViewProps): AbstractGroups<T> {
  const groups = [] as AbstractGroups<T>;
  let group = null as AbstractFormGroupItemType<T>;
  elements?.forEach((element) => {
    const item = createGroupItem(element, props);
    if ('group' in element) {
      group = createGroup(element, props);
      groups.push(group);
    } else if (group) {
      group.items.push(item);
    } else {
      groups.push(item);
    }
  });
  return groups;
}