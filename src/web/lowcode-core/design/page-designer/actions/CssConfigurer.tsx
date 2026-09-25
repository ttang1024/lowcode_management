import React from 'react';
import { AbstractForm } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules, RecordViewProps } from 'lowcode-blocks/src/interface';
import { CodeEditor } from 'lowcode-ui';
import { ruler } from 'lowcode-registry';
import { useScenarioCompletions } from '../components/context-code-editor';

export interface ButtonConfigurerProps extends RecordViewProps<TableButtonModel, PageConfigurerModel> {
  config: PageConfigurerModel
}

export default function CssConfigurer(_props: ButtonConfigurerProps) {
  const autoCompletions = useScenarioCompletions('table');

  // Validation rules
  const rules: AbstractRules = {
    title: [
      ruler.getRule('chooiceRequired', { config: ['title', 'icon'], message: 'Please set at least a button title or icon' }),
    ],
  };

  // Form
  const groups: AbstractGroups<TableButtonModel> = [
    {
      title: '',
      name: 'pageCss',
      render: <CodeEditor mode="css" shared={false} />,
    },
  ];

  // Render
  return (
    <CodeEditor.SharedAutoCompletionsContext.Provider value={{ autoCompletions }}>
      <AbstractForm
        rules={rules} groups={groups} autoFocus="title"
      />
    </CodeEditor.SharedAutoCompletionsContext.Provider>
  );
}
