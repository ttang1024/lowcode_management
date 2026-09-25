/**
 * @module advance-upload
 * @description
 *   Kit `Upload` backed by the lowcode-common OSS gateway.
 *
 *   Value: each file is its storage key (default) or, with `valueMode="object"`,
 *   `{ name, key, url }`. Several files (`multiple` or `maxCount > 1`) give an
 *   array, otherwise a single value. Files still uploading live in local state
 *   and join the value once stored.
 *
 *   Options mirror the upload widget's designer: `storeDir`,
 *   `accept` / `acceptInvalidMessage`, `maxSize` (bytes), `maxCount`,
 *   `listType` (`none` hides the list), `type="drag"` (drop zone),
 *   `uploadText`, plus `onRemove` / `itemRender` / `renderPreview` hooks.
 */
import React from 'react';
import { CloudUpload, Upload as UploadIcon } from 'lucide-react';
import { Button, ImagePreview, Upload, toast, isImageFile, type UploadFile } from 'lowcode-kit';
import { Oss, isAbsoluteUrl } from 'lowcode-common';
import type { AdvanceUploadProps, UploadFileValue } from '../interface';

export type { AdvanceUploadProps, UploadFileValue };

const keyOf = (item: string | UploadFileValue) => (typeof item === 'string' ? item : item.key || item.url || '');

/** Does `file` match an `accept` list (`.png,image/*,application/pdf`)? */
function accepts(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean).some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

const AdvanceUpload: React.FC<AdvanceUploadProps> = (props) => {
  const {
    value, onChange, multiple, maxCount, accept, storeDir, valueMode, maxSize, acceptInvalidMessage, listType = 'picture-card',
    type, uploadText, disabled, onRemove, itemRender, renderPreview, className, style,
  } = props;
  const many = !!multiple || (maxCount ?? 1) > 1;
  const items: Array<string | UploadFileValue> = (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
  const [pending, setPending] = React.useState<UploadFile[]>([]);
  const [preview, setPreview] = React.useState<number | null>(null);
  const valueRef = React.useRef(items);
  valueRef.current = items;

  const urlOf = (item: string | UploadFileValue) => {
    if (typeof item === 'object' && isAbsoluteUrl(item.url)) return item.url;
    const key = keyOf(item);
    return key ? Oss.getUrl(key) : undefined;
  };

  const stored: UploadFile[] = items.map((item, i) => {
    const key = keyOf(item);
    return {
      uid: `v-${key || i}`,
      name: (typeof item === 'object' && item.name) || key.split('/').pop() || `file-${i + 1}`,
      status: 'done',
      url: urlOf(item),
      __value: item,
    };
  });

  const emit = (next: Array<string | UploadFileValue>) => onChange?.(many ? next : next[0]);

  const customRequest = async({ file, onProgress, onSuccess, onError }: any) => {
    try {
      const result = await Oss.uploadToAliOss(file, { storeDir }, (percent: number) => onProgress({ percent }));
      onSuccess(result);
    } catch (error) {
      onError(error);
    }
  };

  const beforeUpload = (file: File) => {
    if (!accepts(file, accept)) {
      toast.error(acceptInvalidMessage || 'This file type is not allowed', file.name);
      return Upload.LIST_IGNORE;
    }
    if (maxSize && file.size > maxSize) {
      toast.error('File is too large', `${file.name} exceeds ${(maxSize / 1024 / 1024).toFixed(1)} MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange = ({ file, fileList }: { file: UploadFile; fileList: UploadFile[] }) => {
    // Stored files the list dropped (removed, or pushed out by `maxCount`).
    const kept = fileList.filter((f) => f.__value !== undefined).map((f) => f.__value);
    if (file.status === 'done' && file.response) {
      const key = file.response.result ?? file.response;
      const entry = valueMode === 'object' ? { name: file.name, key, url: Oss.getUrl(key) } : key;
      setPending((list) => list.filter((f) => f.uid !== file.uid));
      const next = many ? [...valueRef.current, entry] : [entry];
      return emit(maxCount ? next.slice(-maxCount) : next);
    }
    if (file.status === 'error') {
      toast.error('Upload failed', file.error?.message || file.name);
      setPending((list) => list.filter((f) => f.uid !== file.uid));
      return;
    }
    setPending(fileList.filter((f) => f.__value === undefined));
    if (kept.length !== valueRef.current.length) emit(kept);
  };

  const fileList = [...stored, ...pending];
  const images = stored.filter((f) => isImageFile(f) && f.url);
  const card = listType === 'picture-card' || listType === 'picture-circle';
  const drag = type === 'drag';

  const trigger = drag ? (
    <div className="flex w-full min-w-64 flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-slate-300 bg-slate-50/70 px-6 py-6 text-center text-[13px] text-slate-500 transition hover:border-indigo-400">
      <CloudUpload className="size-7 text-indigo-500" />
      <span className="font-medium text-slate-700">{uploadText || 'Click or drag files here'}</span>
      {accept && <span className="text-xs text-slate-400">{accept}</span>}
    </div>
  ) : card ? (uploadText ? <span className="px-2 text-center">{uploadText}</span> : undefined) : (
    <Button icon={<UploadIcon className="size-4" />} disabled={disabled}>{uploadText || 'Upload'}</Button>
  );

  const full = maxCount !== undefined && fileList.length >= maxCount && maxCount > 1;
  return (
    <div className={className} style={style}>
      <Upload
        fileList={fileList}
        accept={accept}
        multiple={multiple}
        maxCount={many ? maxCount : 1}
        disabled={disabled}
        // A drop zone is a full-width area, so drag mode lists files below it.
        listType={drag ? (card || listType === 'picture' ? 'picture' : 'text') : card ? 'picture-card' : listType === 'picture' ? 'picture' : 'text'}
        showUploadList={listType !== 'none'}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={handleChange}
        onRemove={onRemove}
        itemRender={itemRender}
        onPreview={(file) => {
          const i = images.findIndex((f) => f.uid === file.uid);
          if (i >= 0) setPreview(i);
          else if (file.url) window.open(file.url, '_blank', 'noopener');
        }}
      >
        {full && (!card || drag) ? null : trigger}
      </Upload>
      {preview !== null && (renderPreview ?
        renderPreview({ urls: images.map((f) => f.url!), index: preview, onClose: () => setPreview(null) }) :
        <DefaultPreview urls={images.map((f) => f.url!)} index={preview} onClose={() => setPreview(null)} />)}
    </div>
  );
};

function DefaultPreview({ urls, index, onClose }: { urls: string[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = React.useState(index);
  return <ImagePreview open urls={urls} index={current} onIndexChange={setCurrent} onClose={onClose} />;
}

export default AdvanceUpload;
