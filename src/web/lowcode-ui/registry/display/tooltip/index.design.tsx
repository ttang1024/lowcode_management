import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { ColorPicker } from 'lowcode-ui';
import { Input } from 'lowcode-kit';

const PLACEMENT = [
  { label: 'top', value: 'top' },
  { label: 'left', value: 'left' },
  { label: 'right', value: 'right' },
  { label: 'bottom', value: 'bottom' },
  { label: 'topLeft', value: 'topLeft' },
  { label: 'topRight', value: 'topRight' },
  { label: 'bottomLeft', value: 'bottomLeft' },
  { label: 'bottomRight', value: 'bottomRight' },
  { label: 'leftTop', value: 'leftTop' },
  { label: 'leftBottom', value: 'leftBottom' },
  { label: 'rightTop', value: 'rightTop' },
  { label: 'rightBottom', value: 'rightBottom' },
];

function TooltipDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Prompt text', name: 'title', render: <Input /> },
    { title: 'Background color', name: 'color', render: <ColorPicker /> },
    { title: 'Popover position', name: 'placement', render: <RadioList options={PLACEMENT} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(TooltipDesigner);
