import React, { useEffect, useState } from 'react';
import { List, Spinner } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { useFetchApiSource } from '../../../src/api-wrapper';

export interface RuntimeProps {
  itemKey: string
  itemHeight?: number
  height?: number
  header?: string
  gutter?: number
  itemLayout?: '' | 'vertical' | 'infinite'
  child: ComponentModel
  api: ApiWrapperOptions
  split?: boolean
  bordered?: boolean
  style?: React.CSSProperties
  none: string
  value: any
}

function ListRuntime({
  header,
  api,
  child,
  itemLayout,
  itemKey,
  bordered,
  split,
  gutter,
  height,
  itemHeight,
  style,
  value,
}: RuntimeProps) {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 20, models: [] });
  const source = useFetchApiSource<{ models: [] }>(api);

  const pagedQuery = async(reset?: boolean) => {
    setLoading(true);
    const pageIndex = reset ? 1 : pagination.pageIndex + 1;
    try {
      const data = await source.refresh({ pageIndex, pageSize: pagination.pageSize });
      setPagination((p) => ({
        ...p,
        pageIndex,
        models: [...(reset ? [] : p.models), ...(data?.models || [])],
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (api?.type === 'none') {
      setPagination((p) => ({ ...p, models: value || [] }));
    } else {
      pagedQuery(true);
    }
  }, [api]);

  const itemRender = (item: any) => (
    <div style={itemHeight ? { minHeight: itemHeight } : undefined}>
      {component.create(child, item)}
    </div>
  );

  if (itemLayout != 'infinite') {
    return (
      <List
        style={style}
        header={header}
        split={split}
        bordered={bordered}
        grid={itemLayout !== 'vertical' ? { gutter: gutter || 0 } : undefined}
        dataSource={pagination.models || []}
        itemLayout={itemLayout}
        loading={loading}
        rowKey={itemKey}
        renderItem={itemRender}
      />
    );
  }

  // Infinite: a fixed-height scroller that loads the next page near the bottom.
  return (
    <List style={style} header={header} split={split} bordered={bordered}>
      <div
        className="overflow-y-auto"
        style={{ height: height || 400 }}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (!loading && el.scrollHeight - el.scrollTop - el.clientHeight < 40) pagedQuery();
        }}
      >
        {(pagination.models || []).map((item, i) => (
          <div key={itemKey ? item?.[itemKey] ?? i : i} className="border-b border-slate-100 py-2 last:border-b-0">{itemRender(item)}</div>
        ))}
        {loading && <div className="flex justify-center py-3 text-indigo-600"><Spinner className="size-5" /></div>}
      </div>
    </List>
  );
}

export default component.runtime('list', { type: 'display', valueType: 'object[]' })(
  ListRuntime,
);
