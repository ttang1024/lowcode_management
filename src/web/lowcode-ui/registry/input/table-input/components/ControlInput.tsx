import React, { useCallback, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from 'lowcode-kit';
import { AbstractForm, type AbstractGroups, AbstractObject, type SubmitAction } from 'lowcode-blocks';
import ComponentPicker from '../../../../src/component-picker';

export interface ControlInputProps {
  value?: ComponentModel
  onChange?: (value: ComponentModel) => void
}

export default function ControlInput(props: ControlInputProps) {
  const [visible, setVisible] = useState(false);
  const record = props.value;

  const onClose = useCallback(() => {
    setVisible(() => false);
  }, []);

  const onSubmit = useCallback((data: SubmitAction<ComponentModel>) => {
    props.onChange?.(data.model);
    setVisible(false);
  }, []);

  const groups: AbstractGroups<{ model: ComponentModel }> = [
    { name: 'model', title: '', render: <ComponentPicker /> },
  ];

  const model = useMemo(()=>{
    return {
      model: record,
    };
  }, [record]);

  return (
    <>
      <Button onClick={() => setVisible(true)} shape="circle" size="sm" variant="primary" aria-label="Configure input">
        <Settings className="size-3.5" />
      </Button>
      <AbstractObject
        type="modal"
        className="table-input-control-modal"
        title="Configure the column input component"
        width={800}
        record={model}
        onCancel={onClose}
        onSubmit={onSubmit}
        action={visible ? 'update' : ''}
      >
        <div className="scroll-content">
          <AbstractForm groups={groups} />
        </div>
      </AbstractObject>
    </>
  );
}