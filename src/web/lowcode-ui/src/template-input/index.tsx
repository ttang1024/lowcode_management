import React from 'react';
import { Input, Textarea, type InputProps, type TextareaProps } from 'lowcode-kit';

export type TemplateInputProps = InputProps

export type TemplateTextAreaProps = TextareaProps

export function TemplateTextArea(props: TemplateTextAreaProps) {
  return <Textarea {...props} />;
}

export default function TemplateInput(props: TemplateInputProps) {
  return <Input {...props} />;
}

TemplateInput.TextArea = TemplateTextArea;
