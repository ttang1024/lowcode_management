import React, { useCallback, useRef } from 'react';
import { Input, Space } from 'lowcode-kit';
import { EnvVariablesPicker } from '../pickers';

export interface EnvVariblePickerProps {
  onChange?: (value: string) => void
  value?: string
}

export interface VaribleOption {
  name: string
  value: string
}

/** `{ENV_VAR}` prefix + free text, emitted as one string. */
export default function EnvVariablesInput(props: React.PropsWithChildren<EnvVariblePickerProps>) {
  const memo = useRef({ env: '', value: '' });

  const onUpdate = () => {
    props.onChange?.(`{${memo.current.env}}${memo.current.value}`);
  };

  const onChange = useCallback((e) => {
    memo.current.value = e.target.value;
    onUpdate();
  }, []);

  const onEnvChange = useCallback((v) => {
    memo.current.env = v;
    onUpdate();
  }, []);

  return (
    <Space.Compact block>
      <EnvVariablesPicker
        style={{ width: 120 }}
        value={memo.current.env || undefined}
        onChange={onEnvChange}
      />
      <Input value={memo.current.value} onChange={onChange} />
    </Space.Compact>
  );
}
