import { Button, Input, Confirm } from 'lowcode-kit';
import { AbstractTableInput, OptionsPicker } from 'lowcode-blocks';
import type { AbstractEColumns, FilterTabType } from 'lowcode-blocks/src/interface';
import { PublicService } from 'lowcode-services';
import React, { useState } from 'react';

export interface FilterTabsInputProps {
  value?: FilterTabType[]
  onChange?: (value: FilterTabType[]) => void
}

export default function FilterTabsInput(props: FilterTabsInputProps) {
  const columns: AbstractEColumns<{ label: string, value: string }> = [
    { title: 'Name', name: 'label', width: 140, editor: () => <Input /> },
    { title: 'Value', name: 'value', width: 140, editor: () => <Input /> },
  ];

  const [optionKey, setOptionKey] = useState('');

  const onFill = async() => {
    const res = await PublicService.findOptionValues({ pageNo: 1, pageSize: 500, code: optionKey });
    const values = res.models;
    props.onChange && props.onChange(values);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Confirm
          onConfirm={onFill}
          confirmText="Fill"
          title={(
            <div className="w-[240px] font-normal">
              <OptionsPicker value={optionKey} onChange={setOptionKey} optionsKey="@index" />
            </div>
          )}
        >
          <Button>Fill from dictionary</Button>
        </Confirm>
      </div>
      <AbstractTableInput
        operation={{ width: 100 }}
        columns={columns}
        onChange={props.onChange}
        value={props.value}
        moveable
        addButton={<Button variant="primary" size="sm">Add</Button>}
      />
    </div>
  );
}