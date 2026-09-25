import React, { useCallback } from 'react';
import { OptionsPicker } from 'lowcode-blocks';
import lowcodeConfigs from 'lowcode-configs';
import { Input } from 'lowcode-kit';

export interface NameInputProps {
  type: string
  value?: string
  onChange?: (v: string) => void
}

const affix = 'inline-flex h-9 items-center border border-slate-200 bg-slate-50 px-2.5 font-mono text-[13px] text-slate-500';

/** `API_<SYSTEM>_HOST`, with the system picked from the API system dictionary. */
function ApiNameInput(props: NameInputProps) {
  const onChange = useCallback((v) => {
    const name = String(v || '');
    props.onChange?.(`API_${name.toUpperCase()}_HOST`);
  }, [props.onChange]);

  const name = props.value?.split('_')[1] || '';

  return (
    <div className="flex items-stretch">
      <span className={`${affix} rounded-l-lg border-r-0`}>API_</span>
      <OptionsPicker
        value={name}
        onChange={onChange}
        style={{ width: 200 }}
        optionsKey={lowcodeConfigs.API_SYSTEM_KEY}
      />
      <span className={`${affix} rounded-r-lg border-l-0`}>_HOST</span>
    </div>
  );
}

/** `<TYPE>_<name>` free-text variable name. */
function DefaultInput(props: NameInputProps) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(`${props.type}_${e.target.value}`);
  }, [props.onChange, props.type]);

  const value = String(props.value || '').replace(props.type + '_', '');

  return (
    <div className="flex items-stretch">
      <span className={`${affix} rounded-l-lg border-r-0`}>{props.type}_</span>
      <Input onChange={onChange} value={value} className="rounded-l-none" />
    </div>
  );
}

const registrations = {
  'API': ApiNameInput,
  'SYS': DefaultInput,
};

export default function NameInput(props: NameInputProps) {
  const Component = registrations[props.type];
  return Component ? <Component {...props} /> : null;
}
