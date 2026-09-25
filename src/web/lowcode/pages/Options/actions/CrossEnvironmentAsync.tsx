import React, { useCallback, useRef, useState } from 'react';
import { JsonInput, normalizeSyncModel } from 'lowcode-ui';
import { Button, Dialog } from 'lowcode-kit';
import { CrossEnvApiService, OptionsService } from 'lowcode-services';
import type { SyncRowModel } from 'lowcode-ui/src/sync-table-view/SyncButton';
import type { RecordModel } from '../model';
import CrossEnvSync from '../../shared/CrossEnvSync';

/** Edit a remote dictionary's value before it is synced. */
function EditValueDialog({ item, onClose }: { item: RecordModel | null; onClose: () => void }) {
  const [value, setValue] = useState(item?.value);
  React.useEffect(() => setValue(item?.value), [item]);
  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      width={720}
      title={`Edit value · ${item?.name ?? ''}`}
      description="Changes apply to the copy that will be synced into this environment."
      footer={(
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => {item.value = value; onClose();}}>Apply</Button>
        </>
      )}
    >
      <JsonInput value={value} onChange={setValue} />
    </Dialog>
  );
}

export default function CrossEnvironmentAsync() {
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const describeRef = useRef((data: RecordModel) => [
    {
      label: 'Name',
      value: (
        <span className="flex items-center gap-2">
          {data.name}
          <Button size="sm" variant="link" onClick={() => setEditing(data)}>Edit value</Button>
        </span>
      ),
    },
    { label: 'Modified', value: data.updatedAt },
  ]);

  const needSync = useCallback(async(item: SyncRowModel<RecordModel>) => {
    const old = await OptionsService.findOptionByCode(item.data.code);
    return {
      confirm: true,
      old: normalizeSyncModel(old.result || {} as RecordModel),
      title: `Compare · ${item.data.name} (${item.data.code})`,
      value: normalizeSyncModel(item.data),
    };
  }, []);

  return (
    <CrossEnvSync<RecordModel>
      title="Sync dictionaries"
      query={(q) => CrossEnvApiService.pagedQueryEnvOptions(q)}
      rowId={(item) => item.name}
      describe={describeRef.current}
      needSync={needSync}
      onSync={(item) => OptionsService.syncOption(item.data)}
    >
      <EditValueDialog item={editing} onClose={() => setEditing(null)} />
    </CrossEnvSync>
  );
}
