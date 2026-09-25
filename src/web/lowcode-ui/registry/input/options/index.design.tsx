import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { Switch, InputNumber } from 'lowcode-kit';
import { SELECT_MODE } from '../picker/index.design';
import { SizePicker } from '../../../src/pickers';
import SourcePicker from '../../../src/source-picker';

function OptionsPickerDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Data source', name: 'optionsKey', render: <SourcePicker /> },
    {
      title: 'Allow clearing',
      name: 'allowClear',
      extra: 'When enabled, content can be cleared by clicking',
      render: <Switch />,
    },
    {
      title: 'Dialog width',
      name: 'dropdownMatchSelectWidth',
      extra: '',
      render: <InputNumber />,
    },
    {
      title: 'Dialog height',
      name: 'listHeight',
      extra: '',
      render: <InputNumber />,
    },
    {
      title: 'Size',
      name: 'size',
      extra: '',
      render: <SizePicker />,
    },
    {
      title: 'Selection mode',
      name: 'mode',
      initialValue: '',
      render: <RadioList optionType="button" buttonStyle="solid" options={SELECT_MODE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(OptionsPickerDesigner);
