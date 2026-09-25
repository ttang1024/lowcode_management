import React from 'react';
import { Eye, FileText, LoaderCircle, Paperclip, Plus, Trash2 } from 'lucide-react';
import { cn } from './cn';
import { useDisabled } from './context';
import { ImagePreview } from './image';

export interface UploadFile<T = any> {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  thumbUrl?: string;
  percent?: number;
  originFileObj?: File;
  response?: T;
  error?: any;
  size?: number;
  type?: string;
  [key: string]: any;
}

export interface UploadChangeParam<T = any> {
  file: UploadFile<T>;
  fileList: UploadFile<T>[];
}

export interface UploadRequestOption {
  file: File;
  filename?: string;
  onProgress: (event: { percent: number }) => void;
  onSuccess: (response: any, file?: File) => void;
  onError: (error: any) => void;
}

export type UploadItemRender = (
  originNode: React.ReactElement,
  file: UploadFile,
  fileList: UploadFile[],
  actions: { preview: () => void; remove: () => void },
) => React.ReactNode;

export interface UploadProps {
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  onChange?: (info: UploadChangeParam) => void;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  disabled?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean | { showRemoveIcon?: boolean; showPreviewIcon?: boolean };
  /**
   * Runs before each upload. `false` keeps the file in the list without
   * uploading it; `Upload.LIST_IGNORE` drops it. May return a replacement file.
   */
  beforeUpload?: (file: File, fileList: File[]) => boolean | string | void | File | Promise<boolean | string | void | File>;
  /** Performs the upload (required for anything to be sent). */
  customRequest?: (options: UploadRequestOption) => void;
  /** Return `false` (or a promise of it) to keep the file. */
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
  onPreview?: (file: UploadFile) => void;
  itemRender?: UploadItemRender;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

const LIST_IGNORE = '__LIST_IGNORE__';
let uidSeed = 0;
const makeUid = () => `lc-upload-${Date.now()}-${uidSeed++}`;

export const isImageFile = (file: Pick<UploadFile, 'type' | 'url' | 'thumbUrl' | 'name'>) =>
  (file.type ? file.type.startsWith('image/') : false) ||
  /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|#|$)/i.test(file.url || file.thumbUrl || file.name || '');

function ProgressBar({ percent = 0 }: { percent?: number }) {
  return (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-slate-200">
      <span className="block h-full rounded-full bg-indigo-500 transition-[width]" style={{ width: `${Math.round(percent)}%` }} />
    </span>
  );
}

/** File upload with list / picture-card display. */
function UploadBase({
  fileList: fileListProp, defaultFileList, onChange, accept, multiple, maxCount, disabled: disabledProp, listType = 'text',
  showUploadList = true, beforeUpload, customRequest, onRemove, onPreview, itemRender, className, style, children,
}: UploadProps) {
  const disabled = useDisabled(disabledProp);
  const [list, setList] = React.useState<UploadFile[]>(fileListProp ?? defaultFileList ?? []);
  const listRef = React.useRef(list);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
  const objectUrls = React.useRef(new Map<string, string>());

  React.useEffect(() => {
    if (fileListProp) {
      listRef.current = fileListProp;
      setList(fileListProp);
    }
  }, [fileListProp]);

  React.useEffect(() => () => objectUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const commit = (next: UploadFile[], file: UploadFile) => {
    listRef.current = next;
    setList(next);
    onChange?.({ file, fileList: next });
  };
  const patch = (uid: string, changes: Partial<UploadFile>) => {
    const current = listRef.current.find((f) => f.uid === uid);
    if (!current) return; // removed while uploading
    const file = { ...current, ...changes };
    commit(listRef.current.map((f) => (f.uid === uid ? file : f)), file);
  };

  const thumbOf = (f: UploadFile) => {
    if (f.thumbUrl || f.url) return f.thumbUrl || f.url;
    if (f.originFileObj && isImageFile(f)) {
      let u = objectUrls.current.get(f.uid);
      if (!u) {
        u = URL.createObjectURL(f.originFileObj);
        objectUrls.current.set(f.uid, u);
      }
      return u;
    }
    return undefined;
  };

  const addFiles = async(raw: File[]) => {
    if (disabled || !raw.length) return;
    let files = multiple ? raw : raw.slice(0, 1);
    if (maxCount === 1) files = files.slice(-1);
    for (const original of files) {
      let file: File = original;
      let upload = true;
      if (beforeUpload) {
        try {
          const result = await beforeUpload(original, files);
          if (result === LIST_IGNORE) continue;
          if (result === false) upload = false;
          else if (result instanceof File) file = result;
        } catch {
          continue; // a rejected beforeUpload skips the file
        }
      }
      const item: UploadFile = {
        uid: makeUid(),
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file,
        status: upload && customRequest ? 'uploading' : undefined,
        percent: 0,
      };
      // `maxCount` keeps the most recent files.
      let next = [...listRef.current, item];
      if (maxCount && next.length > maxCount) next = next.slice(next.length - maxCount);
      commit(next, item);
      if (upload && customRequest) {
        customRequest({
          file,
          filename: 'file',
          onProgress: ({ percent }) => patch(item.uid, { percent }),
          onSuccess: (response) => patch(item.uid, { status: 'done', percent: 100, response }),
          onError: (error) => patch(item.uid, { status: 'error', error }),
        });
      }
    }
  };

  const remove = async(file: UploadFile) => {
    if (disabled) return;
    const ok = await onRemove?.(file);
    if (ok === false) return;
    const url = objectUrls.current.get(file.uid);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(file.uid);
    }
    commit(listRef.current.filter((f) => f.uid !== file.uid), { ...file, status: 'removed' });
  };

  const images = list.filter((f) => isImageFile(f) && thumbOf(f));
  const preview = (file: UploadFile) => {
    if (onPreview) return onPreview(file);
    if (isImageFile(file) && thumbOf(file)) setPreviewIndex(images.indexOf(file));
    else if (file.url) window.open(file.url, '_blank', 'noopener');
  };

  const listOptions = typeof showUploadList === 'object' ? showUploadList : {};
  const showRemove = listOptions.showRemoveIcon !== false && !disabled;
  const showPreview = listOptions.showPreviewIcon !== false;
  const card = listType === 'picture-card';
  const full = maxCount !== undefined && list.length >= maxCount && maxCount > 1;

  const renderItem = (file: UploadFile) => {
    const thumb = thumbOf(file);
    const failed = file.status === 'error';
    const node = card ? (
      <div
        className={cn(
          'group relative size-[104px] overflow-hidden rounded-xl border bg-white',
          failed ? 'border-red-300' : 'border-slate-200',
        )}
        title={failed ? String(file.error?.message || 'Upload failed') : file.name}
      >
        {thumb && isImageFile(file) ?
          <img src={thumb} alt={file.name} className="size-full object-cover" /> :
          <span className="flex size-full flex-col items-center justify-center gap-1 p-2 text-slate-400"><FileText className="size-7" /><span className="w-full truncate text-center text-xs">{file.name}</span></span>}
        {file.status === 'uploading' && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 px-3 text-xs text-slate-500">
            Uploading…
            <ProgressBar percent={file.percent} />
          </span>
        )}
        {file.status !== 'uploading' && (
          <span className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {showPreview && (thumb || file.url) && (
              <button type="button" onClick={() => preview(file)} aria-label="Preview" className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/90 hover:bg-white/20 hover:text-white">
                <Eye className="size-4" />
              </button>
            )}
            {showRemove && (
              <button type="button" onClick={() => remove(file)} aria-label="Remove" className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/90 hover:bg-white/20 hover:text-white">
                <Trash2 className="size-4" />
              </button>
            )}
          </span>
        )}
      </div>
    ) : (
      <div className={cn('group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50', listType === 'picture' && 'border border-slate-200 p-2', failed && 'text-red-600')}>
        {listType === 'picture' ? (
          thumb && isImageFile(file) ?
            <img src={thumb} alt="" className="size-12 shrink-0 rounded-md object-cover" /> :
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400"><FileText className="size-5" /></span>
        ) : file.status === 'uploading' ? <LoaderCircle className="size-4 shrink-0 animate-spin text-indigo-500" /> : <Paperclip className="size-4 shrink-0 text-slate-400" />}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          {file.url || thumb ? (
            <button type="button" onClick={() => preview(file)} className={cn('cursor-pointer truncate text-left hover:underline', failed ? 'text-red-600' : 'text-indigo-600')}>{file.name}</button>
          ) : <span className="truncate">{file.name}</span>}
          {file.status === 'uploading' && <ProgressBar percent={file.percent} />}
        </span>
        {showRemove && (
          <button type="button" onClick={() => remove(file)} aria-label={`Remove ${file.name}`} className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200/60 hover:text-red-600 focus-visible:opacity-100">
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    );
    const actions = { preview: () => preview(file), remove: () => remove(file) };
    return <React.Fragment key={file.uid}>{itemRender ? itemRender(node, file, list, actions) : node}</React.Fragment>;
  };

  const openPicker = () => !disabled && inputRef.current?.click();
  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(Array.from(e.dataTransfer.files || []));
    },
  };

  // No trigger for an explicit `null`, or a list-style upload with no children.
  const trigger = children === null || (children === undefined && !card) ? null : card ? (
    !full && (
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        {...dropProps}
        className={cn(
          'flex size-[104px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed bg-slate-50/70 text-[13px] text-slate-500 transition',
          dragOver ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-slate-300 hover:border-indigo-400 hover:text-indigo-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {children ?? <><Plus className="size-5" />Upload</>}
      </button>
    )
  ) : (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={openPicker}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
      {...dropProps}
      className={cn('inline-flex', dragOver && 'rounded-lg ring-2 ring-indigo-400', disabled && 'pointer-events-none opacity-60')}
    >
      {children}
    </span>
  );

  return (
    <div className={cn('flex flex-col gap-2', className)} style={style}>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          addFiles(Array.from(e.target.files || []));
          e.target.value = '';
        }}
      />
      {card ? (
        <div className="flex flex-wrap gap-2">
          {showUploadList !== false && list.map(renderItem)}
          {trigger}
        </div>
      ) : (
        <>
          {trigger}
          {showUploadList !== false && list.length > 0 && <div className={cn('flex flex-col', listType === 'picture' ? 'gap-2' : 'gap-0.5')}>{list.map(renderItem)}</div>}
        </>
      )}
      {!onPreview && (
        <ImagePreview
          open={previewIndex !== null}
          onClose={() => setPreviewIndex(null)}
          urls={images.map((f) => thumbOf(f)!)}
          index={previewIndex ?? 0}
          onIndexChange={setPreviewIndex}
        />
      )}
    </div>
  );
}

type UploadComponent = typeof UploadBase & { LIST_IGNORE: string };
export const Upload = UploadBase as UploadComponent;
Upload.LIST_IGNORE = LIST_IGNORE;
