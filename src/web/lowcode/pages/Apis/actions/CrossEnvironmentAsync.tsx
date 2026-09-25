import React, { useCallback } from 'react';
import { Pickers, normalizeSyncModel } from 'lowcode-ui';
import { Code } from 'lowcode-kit';
import { ApisService, CrossEnvApiService } from 'lowcode-services';
import type { SyncRowModel } from 'lowcode-ui/src/sync-table-view/SyncButton';
import type { RecordModel } from '../model';
import CrossEnvSync from '../../shared/CrossEnvSync';

const describe = (api: RecordModel) => [
  { label: 'Name', value: `${api.system} · ${api.name}` },
  { label: 'Endpoint', value: <Code>{api.method} {api.path}</Code> },
  { label: 'Modified', value: api.updatedAt },
  { label: 'Parameters', value: <pre className="m-0 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(api.params, null, 2)}</pre> },
];

export default function CrossEnvironmentAsync() {
  const needSync = useCallback(async(item: SyncRowModel<RecordModel>) => {
    const local = await ApisService.findApiByName(item.data.name);
    return {
      confirm: true,
      title: `API · ${item.data.name}`,
      old: normalizeSyncModel(local.result || {} as RecordModel),
      value: normalizeSyncModel(item.data),
    };
  }, []);

  return (
    <CrossEnvSync<RecordModel>
      title="Sync APIs"
      extraFilters={[{ title: 'System', name: 'system', render: <Pickers.ApiSystem allowClear /> }]}
      query={(q) => CrossEnvApiService.pagedQueryEnvApis(q)}
      rowId={(item) => item.name}
      describe={describe}
      needSync={needSync}
      onSync={(item) => ApisService.syncApi(item.data)}
    />
  );
}
