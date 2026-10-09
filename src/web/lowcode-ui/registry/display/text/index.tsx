import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { dispatcher } from 'lowcode-core';

export interface RuntimeProps {
  value: string
  content?: string
  ellipsis?: boolean
  style?: React.CSSProperties
  // Formatter function
  format?: string
}

/**
 * Text can carry simple markup (e.g. `<b>` from a formatter), but values often
 * come straight from API responses, so scripts, event handlers and
 * `javascript:` links are stripped before rendering.
 */
function sanitize(html: unknown) {
  return DOMPurify.sanitize(html === undefined || html === null ? '' : String(html));
}

function TextRuntime({ format, ...props }: RuntimeProps) {
  const creator = component.useCreator();
  const content = props.value || props.content || '';
  const formatFn = dispatcher.fn.create<string>(format, ['model']);
  const value = format && formatFn ? formatFn(creator.model || {}) : content;
  return (
    <div
      className={cn('text-runtime py-1 text-sm leading-[1.5715] text-slate-800', props.ellipsis && 'w-full truncate')}
      style={props.style}
      dangerouslySetInnerHTML={{ __html: sanitize(value) }}
    >
    </div>
  );
}

export default component.runtime('text', { type: 'display', valueType: 'string' })(
  TextRuntime,
);
