import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input, InputNumber } from 'lowcode-kit';

function ImageGalleryDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Image width', name: 'width', render: <InputNumber /> },
    { title: 'Image height', name: 'height', render: <InputNumber /> },
    { title: 'ImageDescription', name: 'alt', extra: 'Alternative text shown when the image cannot be displayed', render: <Input /> },
    { title: 'Fault tolerance', name: 'fallback', extra: 'Show a placeholder image when loading fails', render: <Input /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ImageGalleryDesigner);
