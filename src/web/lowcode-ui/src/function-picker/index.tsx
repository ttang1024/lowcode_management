import { Check, ChevronsRight } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { Radio, type ChoiceChangeEvent } from 'lowcode-kit';
import { CodeHighlight } from 'lowcode-blocks';
import { FunctionsService } from 'lowcode-services';
import CodeEditor, { type CodeEditorProps } from '../code-editor';


export interface FunctionPickerProps extends CodeEditorProps {
  addonBefore?: string;
  addonAfter?: string;
  value?: string;
  functionType?: string;
  demo?: string
  groups?: boolean
  groupSuffix?: React.ReactNode
  onChange?: (key: string) => void;
  demoFill?: boolean
  shared?:boolean
};

enum Type {
  SELECT = 'select',
  CUSTOM = 'custom',
}

export default function FunctionPicker({
  functionType,
  addonBefore,
  addonAfter,
  demo,
  groups,
  onChange,
  height = 360,
  demoFill,
  ...props
}: FunctionPickerProps) {
  const [type, setType] = useState<Type>(Type.CUSTOM);
  const [value, setValue] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const demoCode = `return ${demo};`;
  const funcResponse = FunctionsService.useQuery([functionType]).pagedQueryOptions({ type: functionType });
  const functions = funcResponse.data?.result?.models || [];

  const options: OptionItemValue[] = [
    { label: 'choose one', value: Type.SELECT },
    { label: 'Custom', value: Type.CUSTOM },
  ];

  useEffect(() => {
    if (!props.value || functions === null) {
      return;
    }
    const foundSnippet = functions?.find((item) => item.snippet === props.value);
    if (foundSnippet) {
      setType(Type.SELECT);
      setValue(props.value);
    } else {
      setType(Type.CUSTOM);
      setCustomValue(props.value);
    }
  }, [props.value, functions]);

  const selectType = ({ target: { value } }: ChoiceChangeEvent) => {
    setType(value);
  };

  const fillDemo = () => {
    if (demoFill && !customValue) {
      setCustomValue(demoCode);
    }
  };

  const picker = useMemo(
    () =>
      (functions || [])?.map((item) => (
        <div
          onClick={() => {
            onChange(item.snippet);
            setValue(item.snippet);
          }}
          className={`relative m-1.5 inline-block h-[190px] w-[380px] cursor-pointer overflow-auto rounded-lg border p-2.5 align-top transition-colors hover:border-indigo-300 ${value === item.snippet ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'}`}
          key={item.id}
        >
          <p className="m-0 mb-2.5 truncate text-[13px] text-emerald-700">
            Purpose: {item.usage}
          </p>
          <CodeHighlight language="javascript" code={item.snippet} />
          {value === item.snippet && <Check size="1em" className="absolute right-1.5 bottom-1.5 text-2xl text-indigo-600" />}
        </div>
      )),
    [value, functions?.length],
  );
  return (
    <div className="func-picker">
      {
        groups !== false && (
          <div className="mb-5 flex items-center gap-3">
            <Radio.Group
              options={options}
              onChange={selectType}
              optionType="button"
              buttonStyle="solid"
              value={type}
            />
            {props.groupSuffix}
          </div>
        )
      }
      <div
        style={{ height: height + 36 }}
        className="flex"
      >
        <div className="h-full min-w-0 flex-[7] overflow-y-auto">
          {type === Type.SELECT ? (
            picker
          ) : (
            <CodeEditor
              {...props}
              shared={props.shared !== false}
              height={height}
              addonBefore={addonBefore}
              addonAfter={addonAfter}
              value={customValue}
              onChange={(v) => {
                onChange(v);
                setCustomValue(v);
              }}
            />
          )}
        </div>
        <div className="flex h-full flex-col justify-center px-1 text-slate-400">
          <ChevronsRight size="1em" />
        </div>
        <div
          onDoubleClick={fillDemo}
          title={demoFill ? 'Double-click to use this example' : undefined}
          className="h-full min-w-0 flex-[3] overflow-hidden rounded-lg border border-slate-200 p-2.5"
        >
          <CodeEditor
            value={demoCode}
            readOnly
            showActiveLine={false}
            setOptions={{
              showLineNumbers: false,
              showFoldWidgets: false,
              showGutter: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};