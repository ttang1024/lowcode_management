import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvancePicker, OptionsPicker } from 'lowcode-blocks';
import { Input, InputNumber, Switch } from 'lowcode-kit';

const REMOVE_TYPES = [
  { label: 'None', value: 'none' },
  { label: 'Confirm', value: 'confirm' },
  { label: 'Confirm again (excluding the just-uploaded image)', value: 'editConfirm' },
];

const LIST_TYPES = [
  { label: 'Hidden', value: 'none' },
  { label: 'Text', value: 'text' },
  { label: 'Image', value: 'picture' },
  { label: 'Image card', value: 'picture-card' },
  { label: 'Image circle', value: 'picture-circle' },
];

AbstractForm.registerConverter('advance-upload-dragger', {
  name: 'advance-upload-dragger',
  getValue: (v) => v === true ? 'drag' : 'select',
  setInput: (v) => v == 'drag',
});

function UploadDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Max count', initialValue: 1, name: 'maxCount', render: <InputNumber min={1} />, extra: 'Upload limit' },
    { title: 'Size limit', name: 'maxSize', render: <InputNumber />, extra: 'Unit: bytes' },
    { title: 'File type', name: 'accept', render: <OptionsPicker optionsKey="mimeTypes" /> },
    { title: 'Enable drag', name: 'type', convert: 'advance-upload-dragger', render: <Switch /> },
    { title: 'Whether multi-select', name: 'multiple', render: <Switch /> },
    { title: 'Button text', name: 'uploadText' },
    {
      title: 'List type',
      name: 'listType',
      initialValue: 'picture-card',
      render: <AdvancePicker data={LIST_TYPES} />,
    },
    { title: 'DeleteMode', name: 'deleteType', render: <AdvancePicker data={REMOVE_TYPES} /> },
    {
      title: 'DeleteConfirm',
      name: 'deleteConfirm',
      render: (<Input.TextArea rows={3} />),
      extra: 'When configured, removing an image asks for confirmation',
    },
    {
      title: 'Enable sorting',
      name: 'sortable',
      render: <Switch />,
      visible: (r) => r.maxCount > 1,
    },
    {
      title: 'Selection hint',
      name: 'acceptInvalidMessage',
      render: (<Input.TextArea rows={3} />),
      extra: 'Prompt text shown when an invalid file is selected',
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(UploadDesigner);
