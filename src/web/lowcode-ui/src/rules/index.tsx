import React, { useEffect, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button, Input, Modal } from 'lowcode-kit';
import { ruler } from 'lowcode-registry';
import { AbstractTableInput } from 'lowcode-blocks';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';

export interface RulesPickerProps {
  title?: string
  value?: FormItemRuleModel[]
  onChange?: (value: FormItemRuleModel[]) => void
}

/** Pick validation rules from the ruler registry and set each one's options and message. */
export default function RulesPicker(props: RulesPickerProps) {
  const [visible, setVisible] = useState(false);
  const registrations = ruler.getAllRegistrations();

  // Every registered rule, filled with the current settings where present.
  const initialRows = useMemo(() => {
    const value = props.value || [];
    return (registrations || []).map((v) => {
      const item = value.find((m) => m.name == v.name);
      return {
        id: v.name,
        key: v.name,
        name: v.name,
        title: v.title,
        message: item ? item.message : v.message,
        options: item?.options,
      };
    });
  }, [props.value]);

  const [rows, setRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState<FormItemRuleModel[]>(props.value || []);

  useEffect(() => {
    if (visible) {
      setRows(initialRows);
      setSelectedRows(props.value || []);
    }
  }, [visible]);

  const onSave = () => {
    const checked = selectedRows.map((m) => m.name);
    props.onChange?.(rows.filter((m) => checked.includes(m.name)) as FormItemRuleModel[]);
    setVisible(false);
  };

  const columns = useMemo<AbstractEColumns<FormItemRuleModel>>(() => [
    { title: 'Rule', name: 'title', width: 160, editable: false },
    {
      title: 'Config',
      name: 'options',
      width: 220,
      editor: (item) => {
        const registration = ruler.getRegistration(item.name);
        return registration?.input || <Input disabled placeholder="-" />;
      },
    },
    { title: 'Tip', name: 'message', width: 220, editor: () => <Input /> },
  ], []);

  return (
    <>
      <Button
        variant="primary"
        shape="circle"
        size="sm"
        aria-label="Validation rules"
        onClick={() => setVisible(true)}
        icon={<Settings size="1em" />}
      />
      <Modal
        title="Validation rules"
        open={visible}
        width={1000}
        onCancel={() => setVisible(false)}
        onOk={onSave}
        okText="Apply"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <AbstractTableInput
            hideOperation
            value={rows}
            onChange={setRows}
            select="multiple"
            rowKey="name"
            selectedRows={selectedRows}
            onSelectRows={setSelectedRows}
            addVisible={() => false}
            columns={columns}
          />
        </div>
      </Modal>
    </>
  );
};
