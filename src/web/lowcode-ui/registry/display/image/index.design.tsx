import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber } from 'lowcode-kit';

function ImageDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Image URL', name: 'src', render: <Input /> },
    { title: 'Image width', name: 'width', initialValue: 100, render: <InputNumber /> },
    { title: 'Image height', name: 'height', initialValue: 100, render: <InputNumber /> },
    { title: 'ImageDescription', name: 'alt', extra: 'Alternative text shown when the image cannot be displayed', render: <Input /> },
    { title: 'Fault tolerance', name: 'fallback', extra: 'Show a placeholder image when loading fails', render: <Input /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ImageDesigner);
