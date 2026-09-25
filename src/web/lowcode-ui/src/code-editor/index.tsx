import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ace from 'ace-builds/src-noconflict/ace';
import AceEditor, { type IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';
import './themes/vscode-dark';

import type { IAceEditor } from 'react-ace/lib/types';
import { AbstractForm } from 'lowcode-blocks';

// ace-builds ships ace.d.ts as a global namespace (not a module); the editor
// annotation shape is structural, so we describe just the fields we read.
type AceAnnotation = { row?: number; column?: number; text?: string; type?: string };

// eslint-disable-next-line camelcase
const publicPath = __webpack_public_path__;

ace.config.set('basePath', new URL('/ace/', publicPath).href);
ace.config.set('workerPath', new URL('/ace/', publicPath).href);

export type AutoCompletion = string | { value: string, meta: string, full?: boolean };

export interface CodeEditorProps extends Omit<IAceEditorProps, 'width' | 'height'> {
  value?: string;
  width?: number
  height?: number
  style?: React.CSSProperties
  addonBefore?: React.ReactNode | React.ReactElement
  addonAfter?: React.ReactNode | React.ReactElement
  placeholder?: string
  onChange?: (key: string) => void;
  autoCompletions?: AutoCompletion[]
  mode?: 'javascript' | 'json' | 'css'
  showActiveLine?: boolean
  sharedKey?: string
  shared?: boolean
  extra?: React.ReactNode | React.ReactElement
  foldLevel?: number
};


export interface SharedAutoCompletionsContextValue {
  autoCompletions?: {
    keys: AutoCompletion[]
    incrementKeys: string[]
    scenario: string
  }
}

const SharedAutoCompletionsContext = React.createContext<SharedAutoCompletionsContextValue>({});

const normalizeAutoComplete = (item: AutoCompletion) => {
  if (typeof item == 'string') {
    return {
      value: item,
      meta: 'variable',
    };
  }
  return {
    ...item,
  };
};

const useAutoCompletiions = (editor: IAceEditor, autoCompletions: AutoCompletion[], sharedKey: string, shared: boolean) => {
  const shareContext = useContext(SharedAutoCompletionsContext);
  useEffect(() => {
    const completer = {
      getCompletions: (editor2: IAceEditor, session, pos, prefix, callback) => {
        let completions = [];
        if (editor2 == editor) {
          autoCompletions = autoCompletions || [];
          completions = autoCompletions.map((w) => normalizeAutoComplete(w));
          if (shared) {
            shareContext.autoCompletions?.keys.forEach((item) => {
              const autoComplete = normalizeAutoComplete(item);
              if (sharedKey && autoComplete.full !== true) {
                completions.push({
                  ...autoComplete,
                });
                autoComplete.value = sharedKey + '.' + autoComplete.value;
              }
              completions.push(autoComplete);
            });
          }
        }
        completions.push({ meta: 'Get the environment variable value', value: 'getEnvVar' });
        callback(null, completions);
      },
    };
    editor?.completers?.push(completer);
    return () => {
      const index = editor?.completers?.indexOf(completer);
      if (index > -1) {
        editor.completers.splice(index, 1);
      }
    };
  }, [autoCompletions, sharedKey, shareContext.autoCompletions, shared, editor]);
};

export default function CodeEditor({
  value,
  style,
  width,
  mode = 'javascript',
  height = 180,
  addonAfter,
  addonBefore,
  placeholder,
  onChange,
  autoCompletions,
  showActiveLine,
  sharedKey,
  shared,
  extra,
  ...props
}: CodeEditorProps) {
  const [editor, setEditor] = useState<IAceEditor>(null);
  const memo = useRef({ error: '', value, id: 0, onChange: null, isInnerUpdate: false, stopOnChange: false });
  const onLoad = useCallback((editor) => setEditor(editor), []);
  const ctx = useContext(AbstractForm.ISolation.Context);
  const editorRef = useRef<AceEditor>(null);
  useAutoCompletiions(editor, autoCompletions, sharedKey, shared !== false);

  memo.current.value = value;
  memo.current.onChange = onChange;

  useEffect(() => {
    if (memo.current.isInnerUpdate) {
      memo.current.isInnerUpdate = false;
      return;
    }
    const editor = editorRef.current?.editor;
    if (editor && editor.getValue() != value) {
      memo.current.stopOnChange = true;
      editor.setValue(String(value || ''), 1);
      setTimeout(() => {
        memo.current.stopOnChange = false;
      }, 20);
    }
  }, [value]);


  const onValueChanged = useCallback((value: string) => {
    if (memo.current.stopOnChange) {
      return;
    }
    memo.current.isInnerUpdate = true;
    clearTimeout(memo.current.id);
    const id = setTimeout(() => memo.current.onChange?.(value), 200) as any;
    memo.current.id = id;
  }, []);

  const defaultOnValidate = useCallback(((annotations: AceAnnotation[]) => {
    annotations = annotations?.filter(item => item.type === 'error');
    if (annotations.length > 0) {
      const anno = annotations[0];
      memo.current.error = `${anno.text} @${anno.row + 1}:${anno.column}`;
    } else {
      memo.current.error = '';
    }
  }), []);
  const onValidate = props.onValidate || defaultOnValidate;

  useEffect(() => {
    if (!props.onValidate && !props.readOnly && ctx?.setMergeValidator) {
      return ctx.setMergeValidator(() => {
        return memo.current.error ? Promise.reject('') : Promise.resolve();
      });
    }
  }, [props.onValidate, props.readOnly]);

  useEffect(() => {
    if (!props.foldLevel) return;
    const editor = editorRef.current?.editor;
    if (editor) {
      const session = editor.getSession() as any;
      session.foldAll(undefined, undefined, props.foldLevel);
      const fold = session.getAllFolds()[0];
      fold && session.expandFold(fold);
    }
  }, [props.foldLevel]);

  return (
    <div
      className={[
        'code-editor font-mono text-xs',
        '[&_.ace_placeholder]:!p-0 [&_.ace_placeholder]:text-sm [&_.ace_placeholder]:whitespace-pre-wrap [&_.ace_placeholder]:transform-none',
        showActiveLine ? '' : '[&_.ace_active-line]:hidden',
      ].join(' ')}
    >
      {
        extra && <div className="-mt-1.5 mb-1.5 text-sm text-slate-500">{extra}</div>
      }
      <div className="flex flex-nowrap overflow-hidden">
        <div className="w-[41px] shrink-0 bg-[#f6f6f6]"></div>
        <div className="-translate-x-2.5">{addonBefore}</div>
      </div>
      <AceEditor
        {...props}
        ref={editorRef}
        mode={mode}
        theme={props.theme || 'chrome'}
        name="format"
        style={style}
        height={height + 'px'}
        width={width + 'px'}
        highlightActiveLine
        onChange={onValueChanged}
        onValidate={onValidate}
        // onChange={onValueChanged}
        defaultValue={value}
        placeholder={placeholder}
        onLoad={onLoad}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          ...(props.setOptions || {}),
        }}
      />
      <div className="flex flex-nowrap overflow-hidden">
        <div className="w-[41px] shrink-0 bg-[#f6f6f6]"></div>
        <div className="-translate-x-2.5">{addonAfter}</div>
      </div>
    </div>
  );
};

CodeEditor.SharedAutoCompletionsContext = SharedAutoCompletionsContext;