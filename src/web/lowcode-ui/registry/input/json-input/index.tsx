import React, { Suspense, useEffect, useState } from 'react';
import { component } from 'lowcode-registry';
import type { CodeEditorProps } from '../../../src/code-editor';

// Loaded on demand: Ace is large and this is the only runtime widget using it,
// so published pages without a JSON field no longer download it.
const CodeEditor = React.lazy(() => import(/* webpackChunkName: "code-editor" */ '../../../src/code-editor'));

export interface JsonInputRuntimeProps extends Omit<CodeEditorProps, 'value' | 'onChange'> {
  valueType: 'json' | 'object'
  value: string | object
  onChange: (value: string | object) => void
}

export function JsonInputRuntime(props: JsonInputRuntimeProps) {
  const [json, setJson] = useState<string>();

  const onChange = (value: string) => {
    try {
      if (props.valueType == 'object') {
        props.onChange?.(JSON.parse(value));
      } else {
        props.onChange?.(value);
      }
    } catch (ex) {
    }
  };

  useEffect(() => {
    if (props.value && typeof props.value !== 'string') {
      setJson(JSON.stringify(props.value || {}, null, 2));
    } else {
      setJson(props.value as string);
    }
  }, [props.value]);

  return (
    <div
      onDragStart={(e) => {
        e.preventDefault();
      }}
      className="json-ace-input [&_.ace_print-margin]:hidden"
    >
      <Suspense fallback={<textarea readOnly className="block w-full font-mono text-xs" rows={6} value={json || ''} />}>
        <CodeEditor
          mode="json"
          theme="one_dark"
          {...props}
          onChange={onChange}
          value={json}
        />
      </Suspense>
    </div>
  );
}

export default component.runtime('json-input', { type: 'input', valueType: 'object' })(JsonInputRuntime);