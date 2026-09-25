import React, { useEffect, useState } from 'react';
import CodeEditor, { type CodeEditorProps } from '../code-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-one_dark';

export interface JsonInputProps extends Omit<CodeEditorProps, 'value' | 'onChange'> {
  height?: number
  width?: number
  value?: object
  className?: string
  onChange?: (value: object) => void
}

export default function JsonInput({ className, width, height = 500, ...props }: JsonInputProps) {
  const [json, setJson] = useState(() => JSON.stringify(props.value || {}, null, 2));

  const onChange = (value: string) => {
    try {
      props.onChange && props.onChange(JSON.parse(value));
    } catch (ex) {
    }
  };

  useEffect(() => {
    setJson(JSON.stringify(props.value || {}, null, 2));
  }, [props.value]);

  return (
    <div
      onDragStart={(e)=>{
        e.preventDefault();
      }}
      className={`${className || ''} json-ace-input [&_.ace_print-margin]:hidden`}
    >
      <CodeEditor
        mode="json"
        theme="one_dark"
        height={height}
        width={width || undefined}
        {...props}
        onChange={onChange}
        value={json}
      />
    </div>
  );
}