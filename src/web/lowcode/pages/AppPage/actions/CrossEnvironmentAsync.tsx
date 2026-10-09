import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pickers } from 'lowcode-ui';
import { AbstractActions } from 'lowcode-blocks';
import { AppPageService, CrossEnvApiService, LoggerService, ResourceService } from 'lowcode-services';
import type { SyncRowModel } from 'lowcode-ui/src/sync-table-view/SyncButton';
import type { RecordViewProps } from 'lowcode-blocks/src/interface';
import PublishConfigurer from 'lowcode-core/design/page-designer/actions/PublishConfigurer';
import type { LoggerModel } from 'lowcode-services/src/LoggerService';
import type { AppPageModel } from 'lowcode-api/models';
import { Code } from 'lowcode-kit';
import type { RecordModel } from '../model';
import CrossEnvSync from '../../shared/CrossEnvSync';

interface SyncRowModelExt<T = any> extends SyncRowModel<T> {
  pageConfig: PageConfigurerModel
}

interface CrossEnvironmentAsyncProps extends RecordViewProps<RecordModel> {
  app: AppConfigurerModel
}

const describe = (page: RecordModel) => [
  { label: 'Page', value: page.name },
  { label: 'Route', value: <Code>{page.appCode}/{page.code}</Code> },
  { label: 'Modified', value: page.updatedAt },
];

// Publish form for a synced page (reuses the designer's publish panel).
const PublishView = (props: any) => <PublishConfigurer {...props} config={props.config} />;

export default function CrossEnvironmentAsync(props: CrossEnvironmentAsyncProps) {
  const app = props.app;
  const envRef = useRef<EnvOption>(undefined);
  const [syncItem, setSyncItem] = useState<PageConfigurerModel>();
  const [logger, setLogger] = useState<LoggerModel>();
  const [loading, setLoading] = useState(false);
  const pending = useRef({ resolve: null as () => void, reject: null as () => void });

  const searchOptions = useMemo(() => ({ initialValues: { appCode: app?.code } }), [app?.code]);

  // Syncing a page publishes it, so confirm the publish details first; the
  // sync button waits on this promise.
  const onSync = useCallback(async(item: SyncRowModelExt<RecordModel>) => {
    const data = item.pageConfig;
    const loggerResponse = await LoggerService.getPageLatestVersion(data.appCode, data.code, envRef.current.value);
    setLogger(loggerResponse.result);
    setSyncItem(data);
    return new Promise<void>((resolve, reject) => {
      pending.current = { resolve, reject };
    });
  }, []);

  const onPublish = useCallback(async(values: LoggerModel) => {
    setLoading(true);
    try {
      const entry = { ...values };
      delete entry.id;
      await AppPageService.syncPage(envRef.current.value, syncItem as any as AppPageModel);
      await AppPageService.publishAppPageOnline(syncItem, entry, true);
      setSyncItem(null);
      pending.current.resolve?.();
    } finally {
      setLoading(false);
    }
  }, [syncItem]);

  const onCancel = useCallback(() => {
    setSyncItem(null);
    pending.current.reject?.();
  }, []);

  const needSync = useCallback(async(item: SyncRowModelExt<RecordModel>) => {
    const data = item.data;
    const page = await ResourceService.getEnvPageConfig(envRef.current.value, data.appCode, data.code);
    page.appCode = page.appCode.toLowerCase();
    // Keep the local id/version so publishing updates the existing page.
    const local = await ResourceService.getPageResource(page.appCode, page.code, false);
    item.pageConfig = page;
    item.pageConfig.id = local.id;
    item.pageConfig.version = local.version;
    return {
      confirm: true,
      title: `Page config diff · ${page.name} (${page.code})`,
      old: JSON.stringify(local || {}, null, 2),
      value: JSON.stringify(page, null, 2),
    };
  }, []);

  return (
    <CrossEnvSync<RecordModel>
      title="Sync pages"
      extraFilters={[{ title: 'App', name: 'appCode', render: <Pickers.AppPicker allowClear /> }]}
      searchOptions={searchOptions}
      query={(q) => CrossEnvApiService.pagedQueryEnvPages(q)}
      rowId={(item) => String(item.id)}
      describe={describe}
      needSync={needSync}
      onSync={onSync}
      onEnvChange={(env) => (envRef.current = env)}
    >
      <AbstractActions
        action={syncItem ? 'publish' : ''}
        model={logger}
        config={syncItem}
        confirmLoading={loading}
        onSubmit={({ model }) => onPublish(model as LoggerModel)}
        onCancel={onCancel}
      >
        <AbstractActions.Popup action="publish" width={600} title={`Publish page · ${syncItem?.name ?? ''}`} use={PublishView} />
      </AbstractActions>
    </CrossEnvSync>
  );
}
