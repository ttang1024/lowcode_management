
import React, { useCallback, useMemo, useRef } from 'react';
import type { AbstractButtons, AbstractColumns, AbstractQueryType, AbstractResponseModel, AbstractSFields } from 'lowcode-blocks/src/interface';
import AbstractTable from 'lowcode-blocks/src/abstract-table';
import { BatchContext, type BatchContextValue, SyncButton, type ResourceSyncHandler, type SyncRowModel, type SyncButtonProps } from './SyncButton';
import { RefreshCw } from 'lucide-react';
import type { AbstractTableProps } from 'lowcode-blocks/src/abstract-table/types';
import { Switch } from 'lowcode-kit';

export interface SyncTableViewProps {
  env: EnvOption
  onChange?: (rows: any[]) => void
  searchFields: AbstractSFields
  searchOptions?: AbstractTableProps<any>['searchOptions'],
  onQuery: (query: AbstractQueryType & { env: string }) => Promise<AbstractResponseModel<SyncRowModel>>
  renderView: (item: SyncRowModel, type: 'left' | 'right') => React.ReactNode
  onSync: (item: SyncRowModel, env: string) => Promise<any>
  onCancel?: () => void
  needSync: SyncButtonProps['needSync']
}

/** Toggle between syncing with a diff review and syncing directly. */
function SkipDiffSwitch({ initial, onChange }: { initial: boolean; onChange: (checked: boolean) => void }) {
  const [checked, setChecked] = React.useState(initial);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
      <Switch
        checked={checked}
        onChange={(v) => {
          setChecked(v);
          onChange(v);
        }}
      />
      {checked ? 'Compare before sync' : 'Skip comparison'}
    </label>
  );
}

export default function SyncTableView(props: SyncTableViewProps) {
  const env = props.env;
  const memo = useRef({
    useDiff: true,
    needSync: props.needSync,
    handlers: {} as Record<string, ResourceSyncHandler>,
  });

  memo.current.needSync = props.needSync;

  const context: BatchContextValue = useMemo(() => {
    return {
      addHandler: (name: string, handler) => {
        memo.current.handlers[name] = handler;
      },
      removeHandler: (name) => {
        delete memo.current.handlers[name];
      },
    };
  }, []);

  const onNeedSync = useCallback((item: SyncRowModel, env: string) => {
    if (memo.current.useDiff) {
      return memo.current.needSync?.(item, env);
    }
    return Promise.resolve({
      confirm: false,
      old: '',
      value: '',
      title: '',
    });
  }, []);

  const onSkipChanged = useCallback((checked) => {
    memo.current.useDiff = checked;
  }, []);

  const batchSyncResources = useCallback(async(rows: SyncRowModel[]) => {
    const handlers = memo.current.handlers;
    for (let i = 0, k = rows.length; i < k; i++) {
      const item = rows[i];
      const handler = handlers[item.id];
      await Promise.resolve(handler?.()).catch(() => { });
    }
  }, []);

  const columns: AbstractColumns<SyncRowModel> = [
    {
      title: `${env?.label}environment`,
      name: 'from',
      width: 300,
      render: (v, item) => props.renderView(item, 'left'),
    },
    {
      title: 'Operate',
      name: 'transfer',
      width: 100,
      render: (v, item) => (
        <SyncButton
          env={env?.value}
          item={item}
          onCancel={props.onCancel}
          needSync={onNeedSync}
          onSync={props.onSync}
        >
        </SyncButton>
      ),
    },
  ];

  const buttons: AbstractButtons<SyncRowModel> = [
    {
      title: 'Bulk sync',
      confirm: 'Are you sure you want to sync the selected resources?',
      icon: <RefreshCw size="1em" />,
      select: 'multiple',
      click: batchSyncResources,
    },
    {
      title: 'Skip diff',
      render: () => (
        <SkipDiffSwitch initial={memo.current.useDiff} onChange={onSkipChanged} />
      ),
    },
  ];

  const onQuery = useCallback(async(params) => {
    params.env = env?.value;
    return props.onQuery(params);
  }, [props.onQuery, env]);

  if (!env) return null;

  return (
    <div style={{ height: window.screen.height - 450 }}>
      <BatchContext.Provider
        value={context}
      >
        <AbstractTable
          searchFields={props.searchFields}
          key={`${env}`}
          onQuery={onQuery}
          buttons={buttons}
          searchOptions={props.searchOptions}
          className="sync-table-view"
          operation={{ fixed: false }}
          columns={columns}
        />
      </BatchContext.Provider>
    </div>
  );
};