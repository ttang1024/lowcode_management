import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, FlipHorizontal2, FlipVertical2, ImageOff, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from './cn';

export interface PreviewTransform {
  url: string;
  index: number;
  scale: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
}

export interface ImagePreviewProps {
  open: boolean;
  onClose: () => void;
  urls: string[];
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Extra toolbar buttons; receives the current image and its transform. */
  toolbarExtra?: (state: PreviewTransform) => React.ReactNode;
}

const toolButton = 'flex size-9 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30';

/** Full-screen image viewer with zoom, rotate, flip and gallery navigation. */
export function ImagePreview({ open, onClose, urls, index: indexProp, onIndexChange, toolbarExtra }: ImagePreviewProps) {
  const [inner, setInner] = React.useState(indexProp ?? 0);
  const index = Math.min(Math.max(indexProp ?? inner, 0), Math.max(urls.length - 1, 0));
  const [scale, setScale] = React.useState(1);
  const [rotate, setRotate] = React.useState(0);
  const [flip, setFlip] = React.useState({ x: false, y: false });
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const reset = () => {
    setScale(1);
    setRotate(0);
    setFlip({ x: false, y: false });
    setOffset({ x: 0, y: 0 });
  };
  React.useEffect(reset, [index, open]);

  const go = (next: number) => {
    if (next < 0 || next >= urls.length) return;
    setInner(next);
    onIndexChange?.(next);
  };
  const zoom = (factor: number) => setScale((s) => Math.min(8, Math.max(0.25, +(s * factor).toFixed(3))));
  const url = urls[index] || '';
  const state: PreviewTransform = { url, index, scale, rotate, flipX: flip.x, flipY: flip.y };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[2500] animate-fade-in bg-slate-950/85" />
        <DialogPrimitive.Content
          data-lc-overlay=""
          aria-describedby={undefined}
          className="fixed inset-0 z-[2500] flex items-center justify-center outline-none"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(index - 1);
            if (e.key === 'ArrowRight') go(index + 1);
          }}
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1)}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <DialogPrimitive.Title className="sr-only">Image preview</DialogPrimitive.Title>
          {url && (
            <img
              src={url}
              alt=""
              draggable={false}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                setOffset({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onDoubleClick={() => (scale === 1 ? setScale(2) : reset())}
              className="max-h-[85vh] max-w-[90vw] cursor-grab object-contain transition-transform duration-150 select-none active:cursor-grabbing"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${flip.x ? -scale : scale}, ${flip.y ? -scale : scale}) rotate(${rotate}deg)`,
              }}
            />
          )}
          <DialogPrimitive.Close className={cn(toolButton, 'absolute top-4 right-4 bg-white/10')} aria-label="Close preview">
            <X className="size-5" />
          </DialogPrimitive.Close>
          {urls.length > 1 && (
            <>
              <button type="button" className={cn(toolButton, 'absolute top-1/2 left-4 size-11 -translate-y-1/2 bg-white/10')} disabled={index === 0} onClick={() => go(index - 1)} aria-label="Previous image">
                <ChevronLeft className="size-6" />
              </button>
              <button type="button" className={cn(toolButton, 'absolute top-1/2 right-4 size-11 -translate-y-1/2 bg-white/10')} disabled={index === urls.length - 1} onClick={() => go(index + 1)} aria-label="Next image">
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 shadow-lg backdrop-blur">
            {urls.length > 1 && <span className="mr-2 text-[13px] text-white/70 tabular-nums">{index + 1} / {urls.length}</span>}
            <button type="button" className={toolButton} onClick={() => setFlip((f) => ({ ...f, y: !f.y }))} aria-label="Flip vertically"><FlipVertical2 className="size-4" /></button>
            <button type="button" className={toolButton} onClick={() => setFlip((f) => ({ ...f, x: !f.x }))} aria-label="Flip horizontally"><FlipHorizontal2 className="size-4" /></button>
            <button type="button" className={toolButton} onClick={() => setRotate((r) => r - 90)} aria-label="Rotate left"><RotateCcw className="size-4" /></button>
            <button type="button" className={toolButton} onClick={() => setRotate((r) => r + 90)} aria-label="Rotate right"><RotateCw className="size-4" /></button>
            <button type="button" className={toolButton} disabled={scale <= 0.25} onClick={() => zoom(1 / 1.5)} aria-label="Zoom out"><ZoomOut className="size-4" /></button>
            <button type="button" className={toolButton} disabled={scale >= 8} onClick={() => zoom(1.5)} aria-label="Zoom in"><ZoomIn className="size-4" /></button>
            {toolbarExtra?.(state)}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------------------------------- Image --------------------------------- */

interface PreviewGroupContextValue {
  register: (src: string) => () => void;
  open: (src: string) => void;
}
const PreviewGroupContext = React.createContext<PreviewGroupContextValue | null>(null);

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  /** Image shown when `src` fails to load. */
  fallback?: string;
  /** Click to open a full-screen preview (default true). */
  preview?: boolean | { src?: string };
  rootClassName?: string;
  placeholder?: React.ReactNode;
}

/** Image with load-error fallback and click-to-preview. */
function ImageBase({ src, fallback, preview = true, width, height, className, rootClassName, style, onError, alt = '', placeholder: _placeholder, ...rest }: ImageProps) {
  const [failed, setFailed] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const group = React.useContext(PreviewGroupContext);
  React.useEffect(() => setFailed(false), [src]);
  const previewSrc = (typeof preview === 'object' && preview.src) || src || '';
  const canPreview = preview !== false && !failed && !!previewSrc;

  React.useEffect(() => {
    if (group && canPreview) return group.register(previewSrc);
  }, [group, canPreview, previewSrc]);

  const shownSrc = failed && fallback ? fallback : src;
  return (
    <span className={cn('relative inline-block overflow-hidden align-middle', rootClassName)} style={{ width, height }}>
      {failed && !fallback ? (
        <span className="flex size-full min-h-8 min-w-8 items-center justify-center bg-slate-100 text-slate-300"><ImageOff className="size-1/3 min-h-4 min-w-4" /></span>
      ) : (
        <img
          src={shownSrc}
          alt={alt}
          width={width}
          height={height}
          onError={(e) => {
            if (!failed) setFailed(true);
            onError?.(e);
          }}
          onClick={canPreview ? () => (group ? group.open(previewSrc) : setOpen(true)) : undefined}
          className={cn('block size-full object-cover', canPreview && 'cursor-zoom-in', className)}
          style={style}
          {...rest}
        />
      )}
      {!group && canPreview && <ImagePreview open={open} onClose={() => setOpen(false)} urls={[previewSrc]} />}
    </span>
  );
}

export interface PreviewGroupProps {
  children?: React.ReactNode;
  /** Explicit image list (otherwise the group's `Image`s register themselves). */
  items?: string[];
  toolbarExtra?: ImagePreviewProps['toolbarExtra'];
}

/** Images inside share one gallery preview. */
function PreviewGroup({ children, items, toolbarExtra }: PreviewGroupProps) {
  const [registered, setRegistered] = React.useState<string[]>([]);
  const [current, setCurrent] = React.useState<number | null>(null);
  const urls = items || registered;
  // Read urls through a ref so the context value stays stable. If it changed
  // with urls, every Image would re-register on each change, producing a new
  // urls array again: an endless render loop.
  const urlsRef = React.useRef(urls);
  urlsRef.current = urls;
  const ctx = React.useMemo<PreviewGroupContextValue>(() => ({
    register: (src) => {
      setRegistered((list) => [...list, src]);
      return () => setRegistered((list) => {
        const i = list.indexOf(src);
        return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)];
      });
    },
    open: (src) => setCurrent(Math.max(0, urlsRef.current.indexOf(src))),
  }), []);

  return (
    <PreviewGroupContext.Provider value={ctx}>
      {children}
      <ImagePreview open={current !== null} onClose={() => setCurrent(null)} urls={urls} index={current ?? 0} onIndexChange={setCurrent} toolbarExtra={toolbarExtra} />
    </PreviewGroupContext.Provider>
  );
}

type ImageComponent = typeof ImageBase & { PreviewGroup: typeof PreviewGroup };
export const Image = ImageBase as ImageComponent;
Image.PreviewGroup = PreviewGroup;
