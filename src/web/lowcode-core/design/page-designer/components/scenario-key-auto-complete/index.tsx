import { AutoComplete } from 'lowcode-kit';
import { CodeEditor } from 'lowcode-ui';
import React, { useContext, useMemo, useState } from 'react';

export interface ScenarioKeyAutoCompleteProps {
  value?: string
  onChange?: (value: string) => void
}

export default function ScenarioKeyAutoComplete(props:ScenarioKeyAutoCompleteProps) {
  const context = useContext(CodeEditor.SharedAutoCompletionsContext);
  const [searchValue, setSearchValue] = useState('');

  const options = useMemo(() => {
    const values = [];
    context.autoCompletions?.incrementKeys.forEach((item) => {
      const data = typeof item == 'string' ? { value: item } : item;
      if (data.value?.indexOf(searchValue) < 0) return;
      values.push({ label: data.value, value: data.value });
    });
    return values;
  }, [context.autoCompletions, searchValue]);


  return (
    <AutoComplete value={props.value} onChange={props.onChange} onSearch={setSearchValue} options={options} />
  );
}