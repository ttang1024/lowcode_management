/**
 * @module interface
 * @description
 *   Shared type contracts for the low-code building blocks. These mirror the
 *   config shapes the original private `lowcode-blocks` accepted. They are kept
 *   permissive (each carries an index signature) so existing call sites keep
 *   compiling — the production web build strips types via Babel.
 */
import type { ReactNode } from 'react';

export type AbstractObjectType = Record<string, any>;

/** Generic key/value object used throughout the low-code config. */
export interface AbstractObjectModel {
  [key: string]: any;
}

/** A standardized API response envelope. */
export interface AbstractResponseModel<T = any> {
  success?: boolean;
  result?: T;
  errorCode?: number | string;
  errorMsg?: string;
  [key: string]: any;
}

export type FormItemLayout = {
  labelCol?: any;
  wrapperCol?: any;
  [key: string]: any;
};

/** Validation rule for a form field (see the kit `FormRule`). */
export interface AbstractRule {
  required?: boolean;
  message?: ReactNode;
  pattern?: RegExp;
  validator?: (...args: any[]) => any;
  [key: string]: any;
}
export type AbstractRules = AbstractRule[] | Record<string, AbstractRule[]>;

/** A single form field definition. */
export interface AbstractFormItemType<TRow = any> {
  name?: string | string[];
  title?: ReactNode;
  label?: ReactNode;
  initialValue?: any;
  render?: ReactNode | ((row: TRow, value: any) => ReactNode);
  rules?: AbstractRule[];
  required?: boolean;
  /** Help text under the field; a function receives the current record. */
  extra?: ReactNode | ((row: TRow) => ReactNode);
  /** Lock the field; a function receives the current record. */
  disabled?: boolean | ((row: TRow) => boolean);
  visible?: boolean | ((row: TRow) => boolean);
  span?: number;
  [key: string]: any;
}

/** A group of form fields rendered together. */
export interface AbstractFormGroupItemType<TRow = any> {
  title?: ReactNode;
  group?: string;
  items?: AbstractFormItemType<TRow>[];
  [key: string]: any;
}

export type AbstractGroups<TRow = any> = Array<AbstractFormGroupItemType<TRow> | AbstractFormItemType<TRow>>;

/** Form fields keyed by name. */
export type AbstractSFields<TRow = any> = AbstractFormItemType<TRow>[];

/** A table column definition. */
export interface AbstractColumnType<TRow = any> {
  title?: ReactNode;
  name?: string;
  dataIndex?: string | string[];
  key?: string;
  width?: number | string;
  fixed?: 'left' | 'right' | boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: TRow, index: number) => ReactNode;
  [key: string]: any;
}
export type AbstractColumns<TRow = any> = AbstractColumnType<TRow>[];

/** An editable table column. */
export interface AbstractEditColumnType<TRow = any> extends AbstractColumnType<TRow> {
  editable?: boolean;
  editor?: ReactNode | ((row: TRow) => ReactNode);
  rules?: AbstractRule[];
}
export type AbstractEColumns<TRow = any> = AbstractEditColumnType<TRow>[];

/** A toolbar / row action button. */
export interface AbstractButton<TRow = any> {
  text?: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  type?: string;
  visible?: boolean | ((row: TRow) => boolean);
  disabled?: boolean | ((row: TRow) => boolean);
  confirm?: string;
  onClick?: (row: TRow, ...args: any[]) => any;
  [key: string]: any;
}
export type AbstractButtons<TRow = any> = AbstractButton<TRow>[];

export type AbstractAction<TRow = any> = AbstractButton<TRow>;
export type InitialAction<TRow = any> = AbstractButton<TRow>;
export type SubmitAction<TRow = any> = AbstractButton<TRow>;

export interface AbstractActionItemContext<TRow = any> {
  record?: TRow;
  index?: number;
  refresh?: () => void;
  [key: string]: any;
}

export interface DrawerActionProps<TRow = any> extends AbstractButton<TRow> {
  width?: number | string;
  title?: ReactNode;
  drawerProps?: any;
}

/** Search / filter field definition. */
export type AbstractFilters<TRow = any> = AbstractFormItemType<TRow>[];

export interface FilterTabType {
  label?: ReactNode;
  value?: string | number;
  key?: string;
  [key: string]: any;
}

export interface AbstractQueryType<T = any> {
  pageNo?: number;
  pageSize?: number;
  query?: T;
  sort?: string;
  order?: string;
  [key: string]: any;
}

export interface AbstractSearchProps<TRow = any> {
  fields?: AbstractFilters<TRow>;
  onSearch?: (values: any) => void;
  tabs?: FilterTabType[];
  [key: string]: any;
}

/** Value converter contract for the form input factory. */
export interface AbstractValueConverter<TIn = any, TOut = any> {
  name?: string;
  format?: (value: TIn) => TOut;
  parse?: (value: TOut) => TIn;
  [key: string]: any;
}
export type ValueConverter<TIn = any, TOut = any> = AbstractValueConverter<TIn, TOut>;

export interface AbstractConfig<TRow = any> {
  id?: string | number;
  version?: string | number;
  groups?: AbstractGroups<TRow>;
  columns?: AbstractColumns<TRow>;
  buttons?: AbstractButtons<TRow>;
  searchFields?: AbstractFilters<TRow>;
  [key: string]: any;
}

export interface RecordViewProps<TRow = any, TConfig = AbstractConfig<TRow>> {
  value?: TRow;
  record?: TRow;
  config?: TConfig;
  groups?: AbstractGroups<TRow>;
  onChange?: (value: TRow) => void;
  [key: string]: any;
}

export interface AbstractTableProps<TRow = any> {
  columns?: AbstractColumns<TRow>;
  dataSource?: TRow[];
  buttons?: AbstractButtons<TRow>;
  rowActions?: AbstractButtons<TRow>;
  searchFields?: AbstractFilters<TRow>;
  rowKey?: string | ((row: TRow) => string);
  loading?: boolean;
  pagination?: any;
  request?: (query: AbstractQueryType) => Promise<AbstractResponseModel<TRow[]>>;
  [key: string]: any;
}

export interface AbstractTableInstance<TRow = any> {
  refresh: () => void;
  reset?: () => void;
  getDataSource?: () => TRow[];
  getSelectedRows?: () => TRow[];
  [key: string]: any;
}

export interface AbstractTableInputProps<TRow = any> {
  value?: TRow[];
  onChange?: (value: TRow[]) => void;
  columns?: AbstractEColumns<TRow>;
  [key: string]: any;
}

export interface ObjectPickerProps<TRow = any> {
  value?: TRow;
  onChange?: (value: TRow) => void;
  columns?: AbstractColumns<TRow>;
  request?: (query: AbstractQueryType) => Promise<AbstractResponseModel<TRow[]>>;
  [key: string]: any;
}

export interface AbstractMenuType {
  key?: string;
  name?: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  path?: string;
  url?: string;
  /** Route-matching/breadcrumb placeholder; not rendered as a selectable menu item. */
  virtual?: boolean;
  children?: AbstractMenuType[];
  [key: string]: any;
}

export interface AbstractMenuProps {
  menus?: AbstractMenuType[];
  selectedKey?: string;
  onSelect?: (info: SelectMenuInfo) => void;
  [key: string]: any;
}

export interface SelectMenuInfo {
  key?: string;
  item?: AbstractMenuType;
  keyPath?: string[];
  [key: string]: any;
}

export interface AbstractInjecterContextValue {
  [key: string]: any;
}

export interface GwImageProps {
  src?: string;
  width?: number | string;
  height?: number | string;
  preview?: boolean;
  [key: string]: any;
}

export interface UploadFileValue {
  name?: string;
  url?: string;
  key?: string;
  size?: number;
  status?: string;
  [key: string]: any;
}

export interface AdvanceUploadProps {
  value?: UploadFileValue | UploadFileValue[];
  onChange?: (value: any) => void;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  storeDir?: string;
  [key: string]: any;
}

export interface AdvancePickerProps<TRow = any, TValue = any> {
  value?: TValue;
  onChange?: (value: TValue) => void;
  options?: Array<{ label: ReactNode; value: any }>;
  request?: (query: any) => Promise<AbstractResponseModel<TRow[]>>;
  [key: string]: any;
}

export interface RadioListProps {
  value?: any;
  onChange?: (value: any) => void;
  options?: Array<{ label: ReactNode; value: any }>;
  [key: string]: any;
}

export interface PageHeaderProps {
  title?: ReactNode;
  subTitle?: ReactNode;
  onBack?: () => void;
  extra?: ReactNode;
  footer?: ReactNode;
  /** `false` hides the header entirely. */
  visible?: boolean;
  [key: string]: any;
}

export interface XlsxPickerProps {
  value?: any;
  onChange?: (rows: any[]) => void;
  [key: string]: any;
}

export interface RegistrationBase {
  type?: string;
  name?: string;
  component?: any;
  [key: string]: any;
}
