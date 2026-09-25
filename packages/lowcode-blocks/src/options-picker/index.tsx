/* eslint-disable react/prop-types */ // props are typed via TS; the rule misreads the augmented component type.
/**
 * @module options-picker
 * @description
 *   Select bound to an options list. The list is either passed statically via
 *   `options`, or loaded from the dictionary identified by `optionsKey` through
 *   the injected `fetchOption(key, query)` service (see `AbstractProvider`).
 */
import React from 'react';
import { Select } from 'lowcode-kit';
import { useInjecter } from '../abstract-injecter';

type OptionItem = { label: React.ReactNode; value: any };

export interface OptionsPickerProps {
  value?: any;
  onChange?: (value: any) => void;
  options?: OptionItem[];
  /** Dictionary code to load options from (`@index` lists all dictionaries). */
  optionsKey?: string;
  /** Prepend an "All" entry (empty value, i.e. no filter). */
  allOption?: boolean;
  mode?: 'multiple' | 'tags';
  [key: string]: any;
}

type OptionsPickerComponent = React.FC<OptionsPickerProps> & {
  /** Read-only view: renders the option label(s) for the current value. */
  OptionsView: React.FC<OptionsPickerProps>;
};

// Dictionaries are small; fetch them in one page.
const FETCH_QUERY = { pageNo: 1, pageSize: 1000 };
// Share one request per dictionary between pickers (e.g. every row of an enum
// table column), and reuse the result briefly so edits still show up soon.
const CACHE_TTL = 30 * 1000;
const optionsCache = new WeakMap<Function, Map<string, { at: number; promise: Promise<OptionItem[]> }>>();

function loadOptions(fetchOption: Function, key: string): Promise<OptionItem[]> {
  let byKey = optionsCache.get(fetchOption);
  if (!byKey) optionsCache.set(fetchOption, byKey = new Map());
  const cached = byKey.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.promise;
  const promise = Promise.resolve(fetchOption(key, FETCH_QUERY)).then((res: any) => {
    const models = Array.isArray(res) ? res : res?.models;
    return Array.isArray(models) ? models : [];
  });
  const entry = { at: Date.now(), promise };
  byKey.set(key, entry);
  promise.catch(() => {
    if (byKey.get(key) === entry) byKey.delete(key);
  });
  return promise;
}

function useOptions(optionsKey: string | undefined, staticOptions: OptionItem[] = []): OptionItem[] {
  const { fetchOption } = useInjecter();
  const [remote, setRemote] = React.useState<OptionItem[]>([]);

  React.useEffect(() => {
    if (!optionsKey || typeof fetchOption !== 'function') return;
    let alive = true;
    loadOptions(fetchOption, optionsKey)
      .then((models) => alive && setRemote(models))
      .catch(() => alive && setRemote([]));
    return () => {
      alive = false;
    };
  }, [optionsKey, fetchOption]);

  return optionsKey ? remote : staticOptions;
}

const OptionsPicker = (({ value, onChange, options, optionsKey, allOption, ...rest }: OptionsPickerProps) => {
  const loaded = useOptions(optionsKey, options);
  const list = allOption ? [{ label: 'All', value: '' }, ...loaded] : loaded;
  return <Select allowClear value={value} onChange={onChange} options={list} {...rest} />;
}) as OptionsPickerComponent;

OptionsPicker.OptionsView = function OptionsView({ value, options, optionsKey }) {
  const list = useOptions(optionsKey, options);
  const arr = Array.isArray(value) ? value : value == null ? [] : [value];
  const labels = arr.map((v) => {
    const opt = list.find((o) => o.value === v);
    return opt ? opt.label : v;
  });
  return <>{labels.filter((x) => x != null).join(', ')}</>;
};

export default OptionsPicker;
