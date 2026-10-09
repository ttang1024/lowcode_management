/**
 * @module CrossEnvSync
 * @description
 *   Shared "sync from another environment" view used by dictionaries, APIs and
 *   pages: pick a source environment, filter its records by modification time
 *   (plus any extra filters), compare each record with the local copy and pull
 *   it over.
 */
import React, { useCallback, useState } from 'react';
import { Pickers, SyncTableView } from 'lowcode-ui';
import type { AbstractSFields } from 'lowcode-blocks';
import type { AbstractTableProps } from 'lowcode-blocks/src/abstract-table/types';
import type { SyncButtonProps, SyncRowModel } from 'lowcode-ui/src/sync-table-view/SyncButton';
import { DateRangeInput, DescriptionList } from 'lowcode-kit';

interface CrossEnvSyncProps<T> {
  title: string;
  /** Filters shown after the time range. */
  extraFilters?: AbstractSFields;
  searchOptions?: AbstractTableProps<any>['searchOptions'];
  /** Query the source environment; resolves to its paged result. */
  query: (query: any) => Promise<{ result: { count: number; models: T[] } }>;
  /** Row id for a remote record. */
  rowId: (item: T) => string;
  /** Label/value pairs describing a record in the comparison table. */
  describe: (item: T) => Array<{ label: React.ReactNode; value: React.ReactNode }>;
  needSync: SyncButtonProps['needSync'];
  onSync: (item: SyncRowModel<T>, env: string) => Promise<any>;
  /** Extra UI rendered below the table (e.g. a publish dialog). */
  children?: React.ReactNode;
  /** Receives the chosen source environment. */
  onEnvChange?: (env: EnvOption) => void;
}

export default function CrossEnvSync<T>(props: CrossEnvSyncProps<T>) {
  const [env, setEnv] = useState<EnvOption>();
  const { query, rowId, describe } = props;

  const searchFields: AbstractSFields = [
    { title: 'Modified', name: 'updatedAt', render: <DateRangeInput /> },
    ...(props.extraFilters || []),
  ];

  const onQuery = useCallback(async(params: any) => {
    const response = await query(params);
    return {
      ...response.result,
      models: response.result.models.map((item) => ({ id: rowId(item), title: '', data: item })),
    };
  }, [query, rowId]);

  const renderView = useCallback((item: SyncRowModel<T>) => (
    <DescriptionList items={describe(item.data)} />
  ), [describe]);

  const chooseEnv = (next: EnvOption) => {
    setEnv(next);
    props.onEnvChange?.(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 text-lg font-semibold text-slate-900">{props.title}</h2>
        <p className="m-0 mt-1 text-sm text-slate-500">Compare records in another environment with this one and pull changes over.</p>
      </div>
      <label className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Source environment</span>
        <span className="min-w-[240px]"><Pickers.EnvPicker value={env} onChange={chooseEnv} /></span>
      </label>
      {env ? (
        <SyncTableView
          env={env}
          key={env.value}
          onQuery={onQuery}
          onSync={props.onSync}
          needSync={props.needSync}
          searchFields={searchFields}
          searchOptions={props.searchOptions}
          renderView={renderView}
        />
      ) : (
        <div className="rounded-2xl border-[1.5px] border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
          Choose a source environment to see what can be synced.
        </div>
      )}
      {props.children}
    </div>
  );
}
