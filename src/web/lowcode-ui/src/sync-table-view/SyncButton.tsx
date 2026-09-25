import { Button, Confirm, Tag } from 'lowcode-kit';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ResourceDiffView from './ResourceDiffView';

export interface SyncRowModel<TRow = any> {
  id: string
  title: React.ReactNode
  data: TRow
}

export type ResourceSyncHandler = () => Promise<any>

export interface NeedSyncConfig {
  title: React.ReactNode
  confirm: boolean
  old: string
  value: string
}

export interface BatchContextValue {
  addHandler: (name: string, handler: ResourceSyncHandler) => void
  removeHandler: (name: string) => void
}

export const BatchContext = React.createContext<BatchContextValue>({} as BatchContextValue);

export interface SyncButtonProps {
  env: string
  item: SyncRowModel
  onSync?: (item: SyncRowModel, env: string) => Promise<any>
  needSync: (item: SyncRowModel, env: string) => Promise<NeedSyncConfig>
  onCancel?: () => void
}

export function SyncButton(props: React.PropsWithChildren<SyncButtonProps>) {
  const item = props.item;
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const batchContext = useContext(BatchContext);
  const [synced, setSynced] = useState(false);
  const memo = useRef({
    canceled: false,
    resolve: null,
    reject: null,
    onCancel: null,
    old: '',
    value: '',
    title: '' as React.ReactNode,
  });

  memo.current.onCancel = props.onCancel;

  const onOk = useCallback((content: string) => {
    setOpen(false);
    memo.current.resolve?.(JSON.parse(content));
  }, []);

  const onCancel = useCallback(() => {
    setOpen(false);
    setLoading(false);
    memo.current.onCancel?.();
    memo.current.canceled = true;
    memo.current.reject?.('resource canceled');
  }, []);


  const doSyncResourceTo = useCallback(async(_e) => {
    try {
      setLoading(true);
      memo.current.canceled = false;
      const data = await Promise.resolve(props.needSync(item, props.env));
      const result = item;
      if (data.confirm) {
        const response = await new Promise((resolve, reject) => {
          setOpen(true);
          memo.current.resolve = resolve;
          memo.current.reject = reject;
          memo.current.old = data.old;
          memo.current.value = data.value;
          memo.current.title = data.title;
        });
        result.data = response;
      }
      await props.onSync?.(result, props.env);
      if (memo.current.canceled) {
        return;
      }
      setSynced(true);
    } finally {
      setLoading(false);
    }
  }, [item, props.env, props.onSync]);

  useEffect(() => {
    const proxySyncResourceTo = () => doSyncResourceTo(null);
    batchContext?.addHandler?.(item.id, proxySyncResourceTo);
    return () => {
      batchContext?.removeHandler?.(item.id);
    };
  }, [doSyncResourceTo]);

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <Confirm
          title="Sync this resource to the current environment?"
          onConfirm={() => doSyncResourceTo(null)}
        >
          {
            synced ?
              (
                <Tag color="success">Synced</Tag>
              ) :
              (
                <Button loading={loading} variant="primary" size="sm" icon={<RefreshCw size="1em" />}>
                  Sync to current
                </Button>
              )
          }
        </Confirm>
        {item?.title && <div className="mt-1 text-xs text-slate-500">{item.title}</div>}
      </div>
      <div className="flex-1">
        {props.children}
      </div>
      <ResourceDiffView
        open={open}
        leftTitle={'currentenvironment'}
        rightTitle={`Source environment(${props.env})`}
        title={memo.current.title || `Compare files - (${props.item.title})`}
        oldValue={memo.current.old}
        newValue={memo.current.value}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  );
}