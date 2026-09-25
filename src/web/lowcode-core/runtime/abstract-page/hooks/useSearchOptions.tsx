import React from 'react';
import { AbstractIcon } from 'lowcode-blocks';
import { Search, Trash2 } from 'lucide-react';
import type { AbstractSearchProps } from 'lowcode-blocks/src/abstract-search';
import { getInitialValue } from 'lowcode-ui/src/initialvalue-setting';

type AbstractSearchOptions = Partial<AbstractSearchProps<any>>

const getInitialValues = (config: PageConfigurerModel) => {
  const searchFields = config?.searchFields;
  const initialValues = {};
  searchFields?.map?.((item) => {
    initialValues[item.name] = getInitialValue(item.initialValueObj);
  });
  return initialValues;
};

export default function useSearchOptions(config: PageConfigurerModel): AbstractSearchOptions {
  const searchOptions = config?.searchOptions;
  const btnQuery = searchOptions?.btnQuery;
  const btnCancel = searchOptions?.btnCancel;
  const shape = btnQuery?.shape;
  const shouldEmpty = shape == 'circle';
  return {
    btnQuery: {
      size: btnQuery?.size as any,
      shape: shape as any,
      title: shouldEmpty ? '' : (btnQuery?.title || 'Query'),
      style: { marginRight: 15, display: btnQuery?.visible == false ? 'none' : undefined },
      icon: btnQuery?.icon ? <AbstractIcon type={btnQuery.icon} /> : <Search size="1em" />,
    },
    itemStyle: {
      marginBottom: config?.searchOptions?.searchLineGap,
    },
    enterKeySubmit: searchOptions?.enterKeySubmit,
    defaultCount: searchOptions?.defaultCount,
    span: searchOptions?.span,
    actionStyle: searchOptions?.isNewLine ? 'newline' : 'inline',
    actionFlow: searchOptions?.buttonFlow,
    initialValues: getInitialValues(config),
    btnCancel: {
      size: btnQuery?.size as any,
      shape: shape as any,
      title: shouldEmpty ? '' : (btnCancel?.title || 'Clear'),
      style: { display: btnCancel?.visible == false ? 'none' : undefined },
      icon: btnCancel?.icon ? <AbstractIcon type={btnCancel.icon} /> : <Trash2 size="1em" />,
    },
  };
}