import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal, toast } from 'lowcode-kit';
import CodeEditor, { type AutoCompletion } from '../code-editor';

export interface FnEditorProps {
  value?: string
  style?: React.CSSProperties
  onChange?: (value: string) => void
}

const autoCompletions: AutoCompletion[] = [
  { value: 'form.getFieldValue', meta: 'Get a single form value' },
  { value: 'form.getFieldsValue', meta: 'Get the form values' },
  { value: 'form.setFieldValue', meta: 'Set a single form value' },
  { value: 'form.setFieldsValue', meta: 'Set the form values' },
  { value: 'rule.required', meta: 'Whether the form is required' },
  { value: 'rule.message', meta: 'Form message' },
];

export default function FnEditor(props: FnEditorProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(props.value);
  const memo = useRef({ hasError: null as any });

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  const onOk = useCallback(() => {
    if (memo.current.hasError) {
      toast.warning('Please fill in the function correctly');
      return;
    }
    props.onChange?.(value);
    setVisible(false);
  }, [value]);

  const onValidate = (annotations) => {
    memo.current.hasError = annotations.find((m) => m.type == 'error');
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button style={props.style} onClick={() => setVisible(true)} variant="primary" size="sm">Edit function</Button>
      <Modal
        open={visible}
        title="Validation function"
        width={640}
        maskClosable={false}
        onCancel={() => setVisible(false)}
        onOk={onOk}
      >
        <Alert type="warning" showIcon className="mb-2.5" message="Return true/false to indicate validation success or failure" />
        <CodeEditor
          addonBefore="function validator(value,rule,form){"
          addonAfter="}"
          shared={false}
          value={value}
          onValidate={onValidate}
          autoCompletions={autoCompletions}
          onChange={setValue}
        />
      </Modal>
    </div>
  );
}
