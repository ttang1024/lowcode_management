/**
 * @module abstract-table-input
 * @description
 *   Editable table form-control. Value is an array of rows; rows can be added
 *   and removed and each editable cell renders its column editor:
 *   - `column.editor(row)` returns a control that gets the cell's value/onChange,
 *   - `column.render(value, row, index)` renders a read-only cell,
 *   - otherwise the column's `render` element / a text input (via InputWrap).
 *
 *   Hooks for hosts: `onCreate(emptyRow)` may return (a promise of) the row to
 *   add, `onRemove(row)` runs before a row is dropped, `addButton` replaces the
 *   default "Add row" button, `addVisible` / `removeVisible` gate the actions.
 *   `select="multiple"` adds a checkbox column (`selectedRows` / `onSelectRows`,
 *   rows matched by `rowKey`).
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Checkbox, Confirm, Table, type TableColumn } from 'lowcode-kit';
import InputWrap from '../abstract-form/InputWrap';
import type { AbstractTableInputProps, AbstractEditColumnType } from '../interface';

export type { AbstractTableInputProps };

const AbstractTableInput: React.FC<AbstractTableInputProps> = (props) => {
  const {
    value, onChange, columns = [], addButton, onCreate, onRemove, hideOperation, addVisible, removeVisible, removeConfirm, disabled,
    select, selectedRows = [], onSelectRows, rowKey,
  } = props;
  const rows: any[] = Array.isArray(value) ? value : [];
  const [busy, setBusy] = React.useState(false);

  const update = (index: number, key: string, cellValue: any) => {
    onChange?.(rows.map((row, i) => (i === index ? { ...row, [key]: cellValue } : row)));
  };

  const remove = async(index: number) => {
    await onRemove?.(rows[index]);
    onChange?.(rows.filter((_, i) => i !== index));
  };

  const add = async() => {
    setBusy(true);
    try {
      const created = onCreate ? await onCreate({}) : {};
      if (created) onChange?.([...rows, created]);
    } finally {
      setBusy(false);
    }
  };

  const canAdd = !disabled && (typeof addVisible === 'function' ? addVisible() !== false : addVisible !== false);
  const canRemove = (row: any) => !disabled && (typeof removeVisible === 'function' ? removeVisible(row) !== false : removeVisible !== false);

  const tableColumns: TableColumn[] = columns.map((column: AbstractEditColumnType) => {
    const key = (column.dataIndex || column.name) as string;
    return {
      key: String(column.key || key),
      title: column.title,
      dataIndex: key,
      width: column.width,
      render: (cellValue: any, row: any, index: number) => {
        if (typeof column.editor === 'function') {
          const node = column.editor(row);
          return React.isValidElement(node) ?
            React.cloneElement(node as React.ReactElement<any>, { value: cellValue, onChange: (e: any) => update(index, key, e && e.target ? e.target.value : e) }) :
            node;
        }
        if (column.editable === false || typeof column.render === 'function') {
          return typeof column.render === 'function' ? column.render(cellValue, row, index) : cellValue;
        }
        return <InputWrap item={column as any} value={cellValue} record={row} disabled={disabled} onChange={(v) => update(index, key, v)} />;
      },
    };
  });

  if (select) {
    const keyOf = (row: any, i: number) => (typeof rowKey === 'function' ? rowKey(row) : rowKey ? row?.[rowKey] : i);
    const selectedKeys = (selectedRows || []).map((r: any) => keyOf(r, -1));
    const isSelected = (row: any, i: number) => selectedKeys.includes(keyOf(row, i));
    const allSelected = rows.length > 0 && rows.every(isSelected);
    tableColumns.unshift({
      key: '__select',
      width: 40,
      title: <Checkbox aria-label="Select all" checked={allSelected} indeterminate={!allSelected && selectedKeys.length > 0} onChange={() => onSelectRows?.(allSelected ? [] : rows)} />,
      render: (_v: any, row: any, index: number) => (
        <Checkbox
          aria-label="Select row"
          checked={isSelected(row, index)}
          onChange={() => onSelectRows?.(isSelected(row, index) ?
            (selectedRows || []).filter((r: any) => keyOf(r, -1) !== keyOf(row, index)) :
            [...(selectedRows || []), row])}
        />
      ),
    });
  }

  if (!hideOperation) {
    tableColumns.push({
      key: '__action',
      title: 'Actions',
      align: 'right',
      width: 90,
      render: (_v: any, row: any, index: number) => {
        if (!canRemove(row)) return null;
        const button = <Button variant="danger-link" size="sm" icon={<Trash2 className="size-3.5" />} onClick={removeConfirm ? undefined : () => remove(index)}>Delete</Button>;
        return removeConfirm ? <Confirm title={removeConfirm} danger onConfirm={() => remove(index)}>{button}</Confirm> : button;
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table columns={tableColumns} rows={rows} rowKey={(_r, i) => i} density="small" empty={<div className="py-6 text-center text-[13px] text-slate-400">No rows yet</div>} />
      </div>
      {canAdd && (
        React.isValidElement(addButton) ?
          <span className="self-start" onClick={add}>{addButton}</span> :
          <Button variant="dashed" block loading={busy} icon={<Plus className="size-4" />} onClick={add}>Add row</Button>
      )}
    </div>
  );
};

export default AbstractTableInput;
