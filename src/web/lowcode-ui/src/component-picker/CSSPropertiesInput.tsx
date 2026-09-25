import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { ColorPicker, CodeEditor } from 'lowcode-ui';
import InputNumber from 'lowcode-ui/registry/input/input-number';
import React, { useCallback } from 'react';

export interface CSSPropertiesInputProps {
  value?: React.CSSProperties
  onChange?: (value: React.CSSProperties) => void
}


export default function CSSPropertiesInput(props: CSSPropertiesInputProps) {
  const onChange = useCallback((value:any)=>{
    props.onChange?.(value);
  }, [props.onChange]);

  const FONT_WEIGHT = [
    { label: 'Thin', value: 'lighter' },
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
  ];

  const groups: AbstractGroups<React.CSSProperties> = [
    { title: 'Font color', name: 'color', render: <ColorPicker /> },
    { title: 'Font size', name: 'fontSize', render: <InputNumber min={9} /> },
    { title: 'Font weight', name: 'fontWeight', initialValue: 'normal', render: <RadioList optionType="button" buttonStyle="solid" options={FONT_WEIGHT} /> },
    { title: 'Margin', name: 'margin' },
    { title: 'Padding', name: 'padding' },
    { title: 'Width', name: 'width', render: <InputNumber min={10} /> },
    { title: 'Height', name: 'height', render: <InputNumber min={10} /> },
    {
      title: 'Dynamic style',
      layout: { labelCol: { span: 24 } },
      name: 'fn',
      render: (
        <CodeEditor
          sharedKey="model"
          height={180}
          addonBefore="function style(model) {"
          addonAfter="}"
        />
      ),
    },
  ];


  return (
    <AbstractForm.ISolation value={props.value} onChange={onChange} groups={groups} />
  );
}