import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { component } from 'lowcode-registry';
import { AdvanceUpload } from 'lowcode-blocks';
import type { AdvanceUploadProps, UploadFileValue } from 'lowcode-blocks/src/advance-upload/type';
import type { UploadFile, UploadItemRender } from 'lowcode-kit';
import { SortContainer } from '../../../src/sortable-list';
import Item, { ConfirmContext } from './Item';
import Preview from './Preview';

export type RuntimeProps = AdvanceUploadProps & {
  deleteConfirm?: string
  deleteType?: string
  sortable?: boolean
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

function AdvanceUploadRuntime(props: RuntimeProps) {
  const [current, setCurrent] = useState<UploadFile | null>(null);
  const memo = useRef({ resolveConfirm: null as null | ((ok: boolean) => void) });
  const confirmContext = useMemo(() => ({ file: current }), [current]);
  const typeId = useMemo(() => `UploadFileList-${Date.now()}`, []);

  // `confirm` asks before every delete; `editConfirm` skips files just uploaded.
  const onRemove = useCallback((f: UploadFile) => {
    const type = props.deleteType || 'none';
    if (type == 'none' || (type === 'editConfirm' && f.originFileObj)) {
      return undefined;
    }
    return new Promise<boolean>((resolve) => {
      setCurrent(f);
      memo.current.resolveConfirm = resolve;
    });
  }, [props.deleteType, props.deleteConfirm]);

  const settle = useCallback((ok: boolean) => {
    setCurrent(null);
    memo.current.resolveConfirm?.(ok);
    memo.current.resolveConfirm = null;
  }, []);

  const itemRender = useCallback<UploadItemRender>((originNode, file, fileList) => {
    return (
      <Item
        file={file}
        fileList={fileList}
        deleteConfirm={props.deleteConfirm}
        originNode={originNode}
        onCancel={() => settle(false)}
        onConfirm={() => settle(true)}
      />
    );
  }, [props.sortable, props.deleteConfirm]);

  useEffect(() => () => memo.current.resolveConfirm?.(false), []);

  const onRefresh = useCallback((e: { key: string, oldKey: string }) => {
    const { key, oldKey } = e;
    const value = props.value;

    if (value instanceof Array) {
      const next = value.map((m: any) => {
        const hit = typeof m === 'string' ? m.indexOf(oldKey) > -1 : (m.key || m.url)?.indexOf(oldKey) > -1;
        if (!hit) return m;
        return typeof m === 'string' ? key : { ...(m as UploadFileValue), key, url: undefined };
      });
      props.onChange?.(next);
    } else {
      props.onChange?.(typeof value === 'object' && value ? { ...value, key, url: undefined } : key);
    }
  }, [props.onChange, props.value]);

  return (
    <ConfirmContext.Provider value={confirmContext}>
      <div onClick={stopPropagation}>
        <SortContainer
          changeAnyway
          type={typeId}
          onChange={props.onChange}
          disabled={!(props.sortable && props.maxCount > 1)}
          value={props.value instanceof Array ? props.value : [props.value].filter(Boolean)}
        >
          <AdvanceUpload
            {...props}
            onRemove={onRemove}
            itemRender={itemRender}
            renderPreview={({ urls, index, onClose }) => (
              <Preview urls={urls} index={index} onClose={onClose} onRefresh={onRefresh} />
            )}
          />
        </SortContainer>
      </div>
    </ConfirmContext.Provider>
  );
}

export default component.runtime('upload', { type: 'input', valueType: 'string|string[]|object[]' })(
  AdvanceUploadRuntime,
);
