/**
 * @module abstract-table
 * @description
 *   Config-driven table for the admin pages and generated app pages:
 *   - an optional filter panel built from `searchFields`,
 *   - a toolbar of buttons (those without `target`),
 *   - per-row action buttons (those with `target: 'cell'`/`'row'`, plus
 *     `rowActions`),
 *   - server pagination driven by `onQuery` + paged `data` (`{ count, models }`).
 *
 *   Buttons may navigate (`action` → routes via the enclosing
 *   {@link ActionsContext}), run a handler (`click`/`onClick`), and/or confirm
 *   (`confirm`). Legacy `dataSource`/`request` props are still honoured, as are
 *   the page designer's `tableOptions` (`initQuery`, `size`, `cellWidth`,
 *   `operation.width`). A toolbar button with `select` adds row checkboxes;
 *   its handler receives the selected rows and it is disabled until some are.
 */
import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button, Checkbox, Confirm, Form, Input, Pagination, Table, Tooltip, cn, type TableColumn } from 'lowcode-kit';
import type { AbstractTableProps, AbstractButton } from '../interface';
import { useActionsContext } from '../abstract-actions';
import { useDesignHooks } from '../abstract-injecter';

export type { AbstractTableInstance } from '../interface';

// Row actions that remove or take something down read as destructive.
const DESTRUCTIVE = /delete|remove|unpublish|offline/i;

type ButtonPlacement = 'primary' | 'toolbar' | 'cell';

function ActionButton({ button, record, onNavigate, placement = 'cell' }: {
  button: AbstractButton;
  record?: any;
  onNavigate?: (action: string, row?: any) => void;
  placement?: ButtonPlacement;
}) {
  const visible = typeof button.visible === 'function' ? button.visible(record) : button.visible !== false;
  if (!visible) return null;
  // A button may render its own control (e.g. a type-to-confirm delete).
  if (typeof (button as any).render === 'function') return <>{(button as any).render(record)}</>;
  const disabled = typeof button.disabled === 'function' ? button.disabled(record) : button.disabled;
  const label = button.text ?? button.title;

  const run = () => {
    if (typeof (button as any).click === 'function') return (button as any).click(record);
    if (typeof button.onClick === 'function') return button.onClick(record);
    if ((button as any).action) onNavigate?.((button as any).action, record);
  };

  const danger = placement === 'cell' && (!!button.danger || DESTRUCTIVE.test(String(label ?? '')));
  const variant = placement === 'primary' || button.type === 'primary' ?
    'primary' :
    placement === 'toolbar' ? 'secondary' : danger ? 'danger-link' : 'link';

  const node = (
    <Button variant={variant} size={placement === 'cell' ? 'sm' : 'md'} icon={button.icon} disabled={!!disabled} onClick={button.confirm ? undefined : run}>
      {label}
    </Button>
  );
  if (button.confirm) {
    return <Confirm title={button.confirm} danger={danger} onConfirm={run}>{node}</Confirm>;
  }
  return node;
}

/**
 * A search field whose `render` is a function (app convention: it receives the
 * current filter values and returns a control). Form.Item hands this wrapper
 * value/onChange, which are bound onto the returned control, as in AbstractForm.
 */
function SearchControl({ render, form, value, onChange, placeholder }: {
  render: (values: Record<string, any>) => React.ReactNode;
  form: any;
  value?: any;
  onChange?: (...args: any[]) => void;
  placeholder?: string;
}) {
  const node = render(form.getFieldsValue(true) || {});
  if (!React.isValidElement(node)) return <>{node}</>;
  const own = (node.props as any).placeholder;
  return React.cloneElement(node as React.ReactElement<any>, { value, onChange, placeholder: own ?? placeholder });
}

const AbstractTable = forwardRef<any, AbstractTableProps>(function AbstractTable(props, ref) {
  const {
    columns = [],
    data,
    dataSource,
    buttons = [],
    rowActions = [],
    searchFields = [],
    request,
    onQuery,
    rowKey = 'id',
    pagination,
    loading: loadingProp,
    sort,
    order,
    inject,
    className,
    initQuery = true,
    size,
    cellWidth,
    operation,
    searchOptions,
    paramMode,
  } = props as any;

  // Page-designer affordances (hover toolboxes, double-click to edit).
  const design = useDesignHooks(inject);

  const actionsCtx = useActionsContext();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({ pageNo: pagination?.current || 1, pageSize: pagination?.pageSize || 10 });
  const [legacyData, setLegacyData] = useState<any[]>(dataSource || []);
  const [selected, setSelected] = useState<any[]>([]);
  // Filters start from `searchOptions.initialValues` and apply to the first query.
  const initialSearch = searchOptions?.initialValues || {};
  const searchRef = useRef<any>(initialSearch);
  // Id of the latest `request` query; older responses are ignored.
  const latestQuery = useRef(0);

  // Rows + total: paged `data` ({ count, models }) wins, else legacy array.
  const paged = data && !Array.isArray(data);
  const rows: any[] = paged ?
    (data.models || data.rows || []) :
    (Array.isArray(data) ? data : (dataSource || legacyData));
  const total: number = paged ? (data.count ?? rows.length) : rows.length;

  const runQuery = useCallback((next: { pageNo: number; pageSize: number }) => {
    // Filters go in `query` (the server's PageQuery shape). `paramMode="mix"`
    // (generated pages calling their own APIs) also repeats them top-level.
    const filters = { ...searchRef.current };
    const base = { pageNo: next.pageNo, pageSize: next.pageSize, sort, order };
    const query = paramMode === 'mix' ? { ...base, ...filters, query: filters } : { ...base, query: filters };
    if (onQuery) return onQuery(query);
    if (request) {
      const id = ++latestQuery.current;
      setLoading(true);
      return Promise.resolve(request(query))
        .then((resp: any) => {
          if (id === latestQuery.current) setLegacyData(resp?.result?.models || resp?.result?.rows || resp?.result || resp?.rows || []);
        })
        .finally(() => id === latestQuery.current && setLoading(false));
    }
  }, [onQuery, request, sort, order, paramMode]);

  // Initial load (and whenever the query source changes), unless the page
  // is configured to wait for an explicit search.
  useEffect(() => {
    if ((onQuery || request) && initQuery !== false) runQuery(page);
  }, [onQuery, request]);

  useEffect(() => {
    if (!paged && dataSource) setLegacyData(dataSource);
  }, [dataSource, paged]);

  const changePage = (pageNo: number, pageSize: number) => {
    setPage({ pageNo, pageSize });
    runQuery({ pageNo, pageSize });
  };

  const onSearch = () => {
    searchRef.current = searchForm.getFieldsValue();
    changePage(1, page.pageSize);
  };
  const onReset = () => {
    searchForm.resetFields();
    searchRef.current = searchForm.getFieldsValue();
    changePage(1, page.pageSize);
  };

  useImperativeHandle(ref, () => ({
    refresh: () => runQuery(page),
    reset: () => {onReset();},
    getDataSource: () => rows,
    getSelectedRows: () => selected,
  }));

  // Toolbar buttons (no target) vs per-row buttons (target set), plus rowActions.
  const toolbarButtons: AbstractButton[] = buttons.filter((b: any) => !b.target && (typeof b.visible === 'function' ? b.visible() : b.visible !== false));
  const cellButtons: AbstractButton[] = [...buttons.filter((b: any) => b.target), ...rowActions];

  const designHeader = (name: string) => design ? {
    onHeaderCell: () => ({
      className: 'cursor-pointer transition-colors hover:bg-indigo-50 hover:text-indigo-600',
      title: 'Double-click to edit',
      onDoubleClick: () => design.listener.onColumnDbClick?.({ name }),
    }),
  } : {};

  const selectable = toolbarButtons.some((b: any) => b.select);
  const keyOfRow = (row: any, i: number) => (typeof rowKey === 'function' ? rowKey(row) : row?.[rowKey] ?? i);
  const selectedKeys = new Set(selected.map((r) => keyOfRow(r, -1)));
  // Selection follows the rows on screen.
  useEffect(() => setSelected([]), [rows.length === 0 ? 0 : keyOfRow(rows[0], 0), page.pageNo]);

  const finalColumns: TableColumn[] = columns
    .filter((c: any) => c.visible !== false)
    .map((c: any) => ({
      key: c.key ?? c.name ?? c.dataIndex,
      title: c.title,
      dataIndex: c.dataIndex ?? c.name,
      // `enums` ([{ label, value }]) displays a value's label.
      render: c.render ?? (Array.isArray(c.enums) ?
        (v: any) => c.enums.find((e: any) => e.value == v)?.label ?? v :
        undefined),
      width: c.width ?? cellWidth,
      align: c.align,
      ellipsis: c.ellipsis,
      className: c.className,
      ...designHeader(c.name ?? c.dataIndex),
    }));
  if (selectable) {
    const allSelected = rows.length > 0 && rows.every((r, i) => selectedKeys.has(keyOfRow(r, i)));
    finalColumns.unshift({
      key: '__select',
      width: 44,
      title: <Checkbox aria-label="Select all rows" checked={allSelected} indeterminate={!allSelected && selected.length > 0} onChange={() => setSelected(allSelected ? [] : rows)} />,
      render: (_v: any, record: any, i: number) => {
        const on = selectedKeys.has(keyOfRow(record, i));
        return <Checkbox aria-label="Select row" checked={on} onChange={() => setSelected(on ? selected.filter((r) => keyOfRow(r, -1) !== keyOfRow(record, i)) : [...selected, record])} />;
      },
    });
  }

  if (cellButtons.length) {
    finalColumns.push({
      key: '__actions',
      title: 'Actions',
      align: 'right',
      width: operation?.width,
      render: (_v: any, record: any) => (
        <div className="flex flex-nowrap items-center justify-end gap-0.5">
          {cellButtons.map((b, i) => <ActionButton key={i} button={b} record={record} onNavigate={actionsCtx.enter} />)}
        </div>
      ),
      ...designHeader('cell-operator'),
    });
  }

  const busy = loadingProp ?? loading;
  const showPagination = pagination !== false && (onQuery || request || paged);

  return (
    <div className={cn('lc-abstract-table flex flex-col gap-4', className)}>
      {searchFields.length > 0 && (
        <Form
          form={searchForm}
          layout="inline"
          initialValues={initialSearch}
          onFinish={onSearch}
          className="lc-table-filters relative flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-slate-200/70 bg-white px-[18px] py-4 shadow-card"
        >
          {searchFields.map((f: any) => {
            const label = f.title ?? f.label;
            return (
              <label key={String(f.name)} className="flex items-center gap-2.5">
                {label && (
                  <span
                    className={cn('text-[13px] font-medium whitespace-nowrap text-slate-500', design && 'cursor-pointer rounded px-0.5 hover:bg-indigo-50 hover:text-indigo-600')}
                    title={design ? 'Double-click to edit' : undefined}
                    onDoubleClick={design ? () => design.listener.onFieldDbClick?.({ name: f.name }, 'AbstractSearch') : undefined}
                  >
                    {label}
                  </span>
                )}
                <span className="min-w-[180px]">
                  <Form.Item noStyle name={f.name} initialValue={f.initialValue}>
                    {typeof f.render === 'function' ?
                      <SearchControl render={f.render} form={searchForm} placeholder={f.placeholder} /> :
                      (f.render || <Input allowClear placeholder={f.placeholder ?? `Filter by ${String(f.title ?? f.name ?? '').toLowerCase()}`} />)}
                  </Form.Item>
                </span>
              </label>
            );
          })}
          <div className="ml-auto flex gap-2">
            <Button variant="primary" type="submit" icon={<Search className="size-4" />}>Search</Button>
            <Button onClick={onReset}>Reset</Button>
          </div>
          {design?.node.appendSearchAfter?.()}
        </Form>
      )}
      {design && searchFields.length === 0 && (
        // Nothing to search yet: give the designer a surface to add the first field.
        <div className="relative flex min-h-16 items-center justify-between gap-3 rounded-2xl border-[1.5px] border-dashed border-indigo-200 bg-indigo-50/40 px-[18px] py-3 text-[13px] text-slate-500">
          <span>No search fields yet — hover to add one.</span>
          {design.node.appendSearchAfter?.()}
        </div>
      )}
      <div className="lc-table-card relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
        {design?.node.appendAbstractTableInner?.()}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 pr-4 pl-5">
          <div className="flex flex-wrap gap-2">
            {toolbarButtons.map((b, i) => (
              <ActionButton
                key={i}
                // Selection buttons act on the checked rows.
                button={(b as any).select ? { ...b, disabled: selected.length === 0 } : b}
                record={(b as any).select ? selected : undefined}
                placement={i === 0 ? 'primary' : 'toolbar'}
                onNavigate={actionsCtx.enter}
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[13px] font-medium text-slate-500 tabular-nums">
              {total.toLocaleString()} {total === 1 ? 'record' : 'records'}
            </span>
            {(onQuery || request) && (
              <Tooltip title="Refresh">
                <Button variant="ghost" size="icon-sm" onClick={() => runQuery(page)} aria-label="Refresh">
                  <RefreshCw className={cn('size-4', busy && 'animate-spin')} />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <Table
          columns={finalColumns}
          rows={rows}
          rowKey={rowKey}
          loading={!!busy}
          density={size === 'small' ? 'small' : size === 'middle' ? 'middle' : 'default'}
        />
        {showPagination && (
          <Pagination
            className="border-t border-slate-100 px-5 py-3.5"
            current={page.pageNo}
            pageSize={page.pageSize}
            total={total}
            onChange={changePage}
          />
        )}
      </div>
    </div>
  );
});

export default AbstractTable;
