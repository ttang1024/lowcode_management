/**
 * @module abstract-table-picker/picker
 * @description
 *   A form control that opens a dialog with a table to pick a record. The
 *   selected row becomes the field value (wrapped in an array when the current
 *   value is an array). Rows come from `onQuery(query)` → `{ count, models }`
 *   (paged) or legacy `request(query)`.
 */
import React, { useRef, useState } from 'react';
import { Button, Dialog, Input, Pagination, Table, type TableColumn } from 'lowcode-kit';
import type { ObjectPickerProps } from '../interface';

export type { ObjectPickerProps };

const labelOf = (v: any) => (v && typeof v === 'object' ? (v.name ?? v.label ?? v.title ?? v.id ?? JSON.stringify(v)) : v ?? '');

const AbstractTablePicker: React.FC<ObjectPickerProps> = ({ value, onChange, columns = [], request, onQuery, disabled, placeholder, title = 'Select a record', rowKey = 'id' }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  // Id of the latest load; responses from older loads are ignored.
  const latestLoad = useRef(0);

  const load = async(next = page) => {
    const id = ++latestLoad.current;
    setPage(next);
    setLoading(true);
    try {
      if (onQuery) {
        const res: any = await onQuery({ ...next, query: {} });
        if (id !== latestLoad.current) return;
        setRows(res?.models || res?.rows || []);
        setTotal(res?.count ?? (res?.models || []).length);
      } else if (request) {
        const res: any = await request({ ...next });
        if (id !== latestLoad.current) return;
        const list = res?.result?.models || res?.result?.rows || (Array.isArray(res?.result) ? res.result : []);
        setRows(list);
        setTotal(res?.result?.count ?? list.length);
      }
    } finally {
      if (id === latestLoad.current) setLoading(false);
    }
  };

  const openDialog = () => {
    if (disabled) return;
    setOpen(true);
    load({ pageNo: 1, pageSize: page.pageSize });
  };

  const pick = (record: any) => {
    onChange?.(Array.isArray(value) ? [record] : record);
    setOpen(false);
  };

  const shown = Array.isArray(value) ? value.map(labelOf).join(', ') : labelOf(value);
  const tableColumns: TableColumn[] = columns.map((c: any) => ({
    key: c.key ?? c.name ?? c.dataIndex,
    title: c.title,
    dataIndex: c.dataIndex ?? c.name,
    render: c.render,
    width: c.width,
  }));

  return (
    <>
      <Input
        readOnly
        value={shown}
        disabled={disabled}
        placeholder={placeholder ?? 'Click to select'}
        onClick={openDialog}
        className="cursor-pointer"
        addonAfter={<button type="button" disabled={disabled} onClick={openDialog} className="cursor-pointer text-indigo-600 disabled:cursor-not-allowed">Select</button>}
      />
      <Dialog open={open} onClose={() => setOpen(false)} title={title} width={760}>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table columns={tableColumns} rows={rows} rowKey={rowKey} loading={loading} density="small" onRowClick={pick} />
          {total > page.pageSize && (
            <Pagination className="border-t border-slate-100 px-4 py-2.5" current={page.pageNo} pageSize={page.pageSize} total={total} onChange={(pageNo, pageSize) => load({ pageNo, pageSize })} />
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </Dialog>
    </>
  );
};

export default AbstractTablePicker;
