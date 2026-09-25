/**
 * @module advance-picker
 * @description
 *   Select whose options come from static `options`, static rows (`data`), or
 *   an async source (`api`, or legacy `request`). Rows are mapped to options
 *   with `labelName` / `valueName` (defaults: `label`/`name`, `value`/`id`).
 *   `format(response)` reshapes an async response before rows are read.
 *   `valueMode="object"` stores the whole row instead of its value field.
 */
import React, { useEffect, useState } from 'react';
import { Select } from 'lowcode-kit';
import type { AdvancePickerProps } from '../interface';

export type { AdvancePickerProps };

type Row = Record<string, any>;

function rowsOf(res: any): Row[] {
  if (Array.isArray(res)) return res;
  return res?.models || res?.rows || res?.result?.models || res?.result?.rows || (Array.isArray(res?.result) ? res.result : []);
}

const AdvancePicker: React.FC<AdvancePickerProps> = (props) => {
  const { value, onChange, options, request, api, data, labelName, valueName, formatLabel, format, valueMode, type: _type, dropdownMatchSelectWidth: _dmsw, ...rest } = props;
  const [remoteRows, setRemoteRows] = useState<Row[]>([]);
  const source = api || request;

  useEffect(() => {
    let active = true;
    if (typeof source === 'function') {
      Promise.resolve(source({})).then((res: any) => {
        if (active) setRemoteRows(rowsOf(typeof format === 'function' ? format(res) : res));
      }).catch(() => active && setRemoteRows([]));
    }
    return () => {active = false;};
  }, [source]);

  const toOption = (r: Row) => ({
    label: labelName ? r[labelName] : (r.label ?? r.name),
    value: valueName ? r[valueName] : (r.value ?? r.id),
    original: r,
  });

  const list = options || (Array.isArray(data) ? data : remoteRows).map(toOption);
  const objectMode = valueMode === 'object';
  const valueKey = valueName || 'value';

  return (
    <Select
      allowClear
      showSearch
      optionFilterProp="label"
      value={objectMode ? value?.[valueKey] : value}
      onChange={objectMode ? (v: any, option: any) => onChange?.(v === undefined ? undefined : option?.original ?? { [valueKey]: v }) : onChange}
      options={list}
      // `formatLabel(option)` customises list rows (the option keeps its source row in `original`).
      optionRender={typeof formatLabel === 'function' ? formatLabel : undefined}
      {...rest}
    />
  );
};

export default AdvancePicker;
