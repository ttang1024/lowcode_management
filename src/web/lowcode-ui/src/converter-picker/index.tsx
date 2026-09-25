import React, { useRef } from 'react';
import { AbstractForm, type AbstractGroups, AdvancePicker } from 'lowcode-blocks';
import { converter } from 'lowcode-registry';

export interface ConverterPickerProps {
  title?: string
  value?: ComponentModel
  onChange?: (value: ComponentModel) => void
}

export default function ConverterPicker(props: ConverterPickerProps) {
  const registrations = converter.getAllRegistrations();
  const cache = useRef<Record<string, string>>({});

  const groups: AbstractGroups<ComponentModel> = [
    {
      title: props.title || 'Converter',
      name: 'name',
      cascade: (v)=>{
        return {
          options: cache[v] || undefined,
        };
      },
      render: (
        <AdvancePicker
          allowClear
          labelName="name"
          valueName="name"
          data={registrations}
        />
      ),
    },
    {
      title: '',
      name: 'options',
      visible: (v) => !!v.name,
      cascade: (v, model)=>{
        cache[model.name] = v;
        return {};
      },
      render2: (row) => {
        const registration = converter.getRegistration(row.name);
        return <AbstractForm.ISolation groups={registration?.options} />;
      },
    },
  ];

  return (
    <AbstractForm.ISolation
      value={props.value}
      onChange={props.onChange}
      groups={groups}
    />
  );
}