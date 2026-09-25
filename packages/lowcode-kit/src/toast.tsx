/**
 * Toasts.
 *
 *   toast.success('Saved');
 *   const done = toast.loading('Publishing…'); …; done();
 *   toast.error('Request failed', 'The server returned 500');
 *
 * The viewport mounts itself on first use, so no provider is needed.
 */
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { cn } from './cn';
import { Spinner } from './spinner';

type Tone = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ToastItem {
  id: number;
  tone: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
}

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

let mounted = false;
function ensureViewport() {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;
  const host = document.createElement('div');
  host.setAttribute('data-lc-toasts', '');
  document.body.appendChild(host);
  createRoot(host).render(<Viewport />);
}

function push(tone: Tone, title: React.ReactNode, description?: React.ReactNode, duration?: number) {
  ensureViewport();
  const id = nextId++;
  items = [...items.slice(-4), { id, tone, title, description }];
  emit();
  const ms = duration ?? (tone === 'loading' ? 0 : tone === 'error' ? 6000 : 3000);
  if (ms > 0) setTimeout(() => dismiss(id), ms);
  return () => dismiss(id);
}

export const toast = {
  success: (title: React.ReactNode, description?: React.ReactNode) => push('success', title, description),
  error: (title: React.ReactNode, description?: React.ReactNode) => push('error', title, description),
  info: (title: React.ReactNode, description?: React.ReactNode) => push('info', title, description),
  warning: (title: React.ReactNode, description?: React.ReactNode) => push('warning', title, description),
  /** Stays until the returned function is called. */
  loading: (title: React.ReactNode = 'Loading…') => push('loading', title),
  dismiss,
};

const icons: Record<Tone, React.ReactNode> = {
  success: <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white"><svg viewBox="0 0 16 16" className="size-3" fill="currentColor"><path d="M6.3 11.3 2.9 7.9l1.1-1.1 2.3 2.3 5.7-5.7 1.1 1.1z" /></svg></span>,
  error: <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">!</span>,
  warning: <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">!</span>,
  info: <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">i</span>,
  loading: <Spinner className="size-5 text-indigo-600" />,
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function Viewport() {
  const list = useSyncExternalStore(subscribe, () => items);
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-[3000] flex w-[min(420px,calc(100vw-32px))] -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex max-w-full animate-toast-in items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-float',
            t.tone === 'error' ? 'border-red-100' : 'border-slate-100',
          )}
        >
          <span className="mt-px shrink-0">{icons[t.tone]}</span>
          <div className="min-w-0">
            <div className="font-medium text-slate-900">{t.title}</div>
            {t.description && <div className="mt-0.5 break-words text-slate-500">{t.description}</div>}
          </div>
          {t.tone !== 'loading' && (
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="-mr-1 ml-1 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><path d="M3.7 2.6 8 6.9l4.3-4.3 1.1 1.1L9.1 8l4.3 4.3-1.1 1.1L8 9.1l-4.3 4.3-1.1-1.1L6.9 8 2.6 3.7z" /></svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
