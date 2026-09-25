import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { ImagePreview, Modal, Progress, type PreviewTransform } from 'lowcode-kit';
import { Oss } from 'lowcode-common';

interface PreviewProps {
  urls: string[]
  index: number
  onClose: () => void
  /** A rotated copy was saved: replace `oldKey` with `key` in the value. */
  onRefresh?: (data: { key: string, oldKey: string }) => void
}

/** Save the image at its current rotation as a new object in the same folder. */
async function saveRotated(state: PreviewTransform, onProgress: (percent: number) => void) {
  const realUrl = (state.url.split('?').shift() || '').replace(/^\/\//, 'https://');
  const r = state.rotate % 360;
  const degrees = r < 0 ? 360 + r : r;
  const meta = new URL(realUrl);
  const name = meta.pathname.split('/').pop() || 'image.jpg';
  const dir = meta.pathname.split('/').slice(2, -1).join('/');
  const blob = await fetch(`${realUrl}?x-oss-process=image/rotate,${degrees}`, { credentials: 'include' }).then((res) => res.blob());
  const file = new File([blob], name, { type: 'image/jpg' });
  const result = await Oss.uploadToAliOss(file, { storeDir: dir }, onProgress);
  return { key: result.result, oldKey: name };
}

function SaveProgress({ register }: { register: (set: (n: number) => void) => void }) {
  const [percent, setPercent] = useState(0);
  register(setPercent);
  return <div className="mt-3"><Progress percent={percent} /></div>;
}

/** Image preview for the upload widget, with a "save rotated" action. */
export default function Preview({ urls, index, onClose, onRefresh }: PreviewProps) {
  const [current, setCurrent] = useState(index);

  const onSave = (state: PreviewTransform) => {
    if (state.rotate % 360 === 0) return;
    let setPercent: (n: number) => void = () => undefined;
    const register = (set: (n: number) => void) => {
      setPercent = set;
    };
    Modal.confirm({
      title: 'Save the rotated image?',
      content: <SaveProgress register={register} />,
      okText: 'Save',
      onOk: async() => {
        try {
          const result = await saveRotated(state, (p) => setPercent(p));
          onRefresh?.(result);
          onClose();
        } catch (ex) {
          Modal.error({ title: 'Save failed', content: String(ex?.message || '') });
        }
      },
    });
  };

  return (
    <ImagePreview
      open
      urls={urls}
      index={current}
      onIndexChange={setCurrent}
      onClose={onClose}
      toolbarExtra={(state) => (
        <button
          type="button"
          onClick={() => onSave(state)}
          disabled={state.rotate % 360 === 0}
          title="Save rotated image"
          aria-label="Save rotated image"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Save className="size-4" />
        </button>
      )}
    />
  );
}
