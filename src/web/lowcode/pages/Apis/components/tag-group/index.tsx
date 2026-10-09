import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagGroupProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

/** Editable list of short tags (e.g. parameter names). */
export default function TagGroup(props: TagGroupProps) {
  const [tags, setTags] = useState<string[]>(props.value || []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setTags(props.value || []), [props.value]);
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const commit = (next: string[]) => {
    setTags(next);
    props.onChange?.(next);
  };

  const confirmDraft = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) commit([...tags, value]);
    setAdding(false);
    setDraft('');
  };

  const chip = 'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[13px]';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={`${chip} border-slate-200 bg-slate-50 font-mono text-slate-700`}>
          {tag}
          {!props.disabled && (
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => commit(tags.filter((t) => t !== tag))}
              className="flex cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size="1em" className="text-[10px]" />
            </button>
          )}
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirmDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              confirmDraft();
            } else if (e.key === 'Escape') {
              setAdding(false);
              setDraft('');
            }
          }}
          className="h-7 w-28 rounded-md border border-indigo-400 px-2 font-mono text-[13px] outline-none ring-3 ring-indigo-500/15"
        />
      ) : !props.disabled && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={`${chip} cursor-pointer border-dashed border-slate-300 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600`}
        >
          <Plus size="1em" className="text-[11px]" /> Add
        </button>
      )}
    </div>
  );
}
