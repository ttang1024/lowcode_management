import type { AbstractSFields } from 'lowcode-blocks';
import dispatcher from '../../dispatcher';
import createComponent from './createComponent';
import { createLayout } from './useFormGroups';

export default function useSearchFields(searchFields: TableSearchModel[], config: PageConfigurerModel) {
  const searchLabelWidth = config?.searchOptions?.searchLabelWidth;
  const response = searchFields?.map((item) => {
    const create = (data: Record<string, any>) => createComponent(item.component, data, item.componentCss, {}, {
      type: 'useSearchFields',
      item: item,
    });
    const key = item?.component?.key?.trim();
    const labelWidth = item.labelWidth || searchLabelWidth;

    return {
      name: item.name,
      title: item.title,
      span: item.span,
      placeholder: item.placeholder,
      extra: item.extra,
      disabled: item.disabled,
      break: item.break,
      auto: item.auto,
      convert: item.convert ? [item.convert.name, item.convert.options] : undefined,
      render: key ? create : create({}),
      layout: labelWidth > 0 ? createLayout(labelWidth) : undefined,
      cascade: item.cascade ? dispatcher.fn.create(item.cascade, ['value', 'model']) : undefined,
    };
  }) as AbstractSFields;
  return response || [];
}