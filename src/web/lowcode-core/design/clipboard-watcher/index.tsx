import { Modal, copyText } from 'lowcode-kit';
import React, { useEffect, useState } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import CopyPageView from './src/CopyPageView';
import CopyFormView from './src/CopyFormView';
import CopyButtonView from './src/CopyButtonView';
import lowcodeConfigs from 'lowcode-configs';
import { ResourceService } from 'lowcode-services';

export interface CopyViewProps {
  data: ClipboardDesignModel
  onClose: () => void
}

export type CopyView = React.FC<CopyViewProps>

export interface ClipboardWatcherProps {
  refresh?: 'design' | 'reload'
  appCode: string
}

export interface ClipboardCopyProps {
  data: any
  type: ClipboardDesignModel['type']
  visible?: boolean
  onSuccess?: () => void
}

const components = {
  'page': CopyPageView,
  'form': CopyFormView,
  'button': CopyButtonView,
};

function toJSON<T>(content: string) {
  try {
    return JSON.parse(content) as T;
  } catch (ex) {
    return null;
  }
};

export default function ClipboardWatcher(props: ClipboardWatcherProps) {
  const [data, setClipboard] = useState<ClipboardDesignModel>(null);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const element = e.target as HTMLElement;
      const name = element.tagName;
      const editable = element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') != 'false';
      if (name == 'INPUT' || name == 'TEXTAREA' || editable) {
        return;
      }
      const data = toJSON<ClipboardDesignModel>(e.clipboardData.getData('text/plain'));
      data?.name == 'lowcode' && setClipboard(data);
    };
    document.body.addEventListener('paste', onPaste);
    return () => document.body.removeEventListener('paste', onPaste);
  }, [props.appCode]);

  const CopyView = components[data?.type];

  return (
    <React.Fragment>
      {CopyView && <CopyView data={data} onClose={() => setClipboard(null)} />}
    </React.Fragment>
  );
}

ClipboardWatcher.Copy = function Copy(props: React.PropsWithChildren<ClipboardCopyProps>) {
  if (props.visible === false) return null;

  return (
    <span
      className="contents"
      onClick={async() => {
        // Serialise at click time: the designer mutates `data` in place, so a
        // memoised string would be stale, and stringifying on every edit is wasted.
        const data = JSON.stringify({
          data: props.data,
          type: props.type,
          from: lowcodeConfigs.ENV as any,
          name: 'lowcode',
        } as ClipboardDesignModel);
        if (await copyText(data, 'Copied successfully')) props.onSuccess?.();
      }}
    >
      {props.children}
    </span>
  );
};

const copyItem = 'flex w-[120px] cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-indigo-200 px-2.5 py-5 text-sm font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 active:opacity-80';

ClipboardWatcher.CopyPage = function CopyPage(props: React.PropsWithChildren<{ data: PageConfigurerModel }>) {
  const [visible, setVisible] = useState(false);
  const [remote, setRemote] = useState<PageConfigurerModel>();
  const data = props.data;

  useEffect(() => {
    if (!data || !visible) return;
    ResourceService.getPageResourceNoCache(data.appCode, data.code).then((response) => {
      setRemote(response);
    });
  }, [visible]);

  return (
    <>
      <span onClick={() => setVisible(true)} >
        {props.children}
      </span>
      <Modal
        open={visible}
        title="Copy page"
        footer={false}
        onCancel={() => setVisible(false)}
      >
        <div className="flex justify-center gap-5 pt-5 pb-7">
          <ClipboardWatcher.Copy
            type="page"
            data={remote}
            visible={remote?.status != 404}
            onSuccess={() => setVisible(false)}
          >
            <button type="button" className={copyItem}>
              <RefreshCw className="size-9" />
              Copy release
            </button>
          </ClipboardWatcher.Copy>
          <ClipboardWatcher.Copy
            type="page"
            data={data}
            onSuccess={() => setVisible(false)}
          >
            <button type="button" className={copyItem}>
              <Cloud className="size-9" />
              Copy local
            </button>
          </ClipboardWatcher.Copy>
        </div>
      </Modal>
    </>
  );
};
