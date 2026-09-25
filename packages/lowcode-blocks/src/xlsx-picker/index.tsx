/* eslint-disable react/prop-types */ // props are typed via TS; the rule cannot read them through the augmented `React.FC<P>` component type.
/**
 * @module xlsx-picker
 * @description
 *   Upload control that parses a spreadsheet into rows. CSV is parsed natively;
 *   to support real .xlsx, install `xlsx` and set `XlsxPicker.parser`.
 */
import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button, Upload } from 'lowcode-kit';
import type { XlsxPickerProps } from '../interface';

export type { XlsxPickerProps };

function parseCsv(text: string): any[] {
  const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const keys = header.split(',').map((k) => k.trim());
  return lines.map((line) => {
    const cells = line.split(',');
    return keys.reduce((row: any, key, i) => {row[key] = cells[i]; return row;}, {});
  });
}

interface XlsxPickerComponent extends React.FC<XlsxPickerProps> {
  /** Optional parser override, e.g. backed by the `xlsx` package. */
  parser?: (buffer: ArrayBuffer) => any[] | Promise<any[]>;
}

const XlsxPicker: XlsxPickerComponent = ({ onChange, disabled }) => {
  const beforeUpload = async(file: File) => {
    const buffer = await file.arrayBuffer();
    const rows = XlsxPicker.parser ?
      await XlsxPicker.parser(buffer) :
      parseCsv(new TextDecoder().decode(buffer));
    onChange?.(rows);
    return false; // prevent auto upload
  };

  return (
    <Upload accept=".xlsx,.xls,.csv" beforeUpload={beforeUpload} maxCount={1} disabled={disabled}>
      <Button icon={<FileSpreadsheet className="size-4" />} disabled={disabled}>Import spreadsheet</Button>
    </Upload>
  );
};

export default XlsxPicker;
