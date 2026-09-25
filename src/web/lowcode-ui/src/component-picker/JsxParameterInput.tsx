import { Button, Input, Modal } from 'lowcode-kit';
import { AbstractTableInput } from 'lowcode-blocks';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import React, { useState } from 'react';

export interface JsxParameterInputProps {
  value?: JsxParameter[]
  parameters: string[]
  onChange?: (value: JsxParameter[]) => void
}

export default function JsxParameterInput(props: JsxParameterInputProps) {
  const [visible, setVisible] = useState(false);
  const value = props.value || [];
  const items = (props.parameters || []).map((name) => {
    const v = value.find((m) => m.name == name)?.value;
    return {
      name: name,
      value: v,
    };
  });

  const columns: AbstractEColumns<JsxParameter> = [
    { title: 'Parameter name', name: 'name', editor: () => <Input /> },
    { title: 'Source field', name: 'value', editor: () => <Input /> },
  ];

  const onChange = (value) => {
    props.onChange && props.onChange(
      value?.filter((m) => m.value !== '' && m.value !== undefined),
    );
  };

  return (
    <React.Fragment>
      <Button variant="primary" size="sm" onClick={() => setVisible(true)}>
        Go configure
      </Button>
      <Modal
        width={600}
        title="Pass-through parameter mapping"
        open={visible}
        footer={<Button variant="primary" onClick={() => setVisible(false)}>Close</Button>}
        onCancel={() => setVisible(false)}
      >
        <AbstractTableInput
          value={items}
          onChange={onChange}
          columns={columns}
          rowKey="name"
          hideOperation
          addVisible={() => false}
        />
      </Modal>
    </React.Fragment>
  );
}