import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { InputNumber } from 'lowcode-kit';
import ColorPicker from '../../../src/color-picker';

const MODE = [
  { label: 'Canvas', value: 'canvas' },
  { label: 'Svg', value: 'svg' },
];

const initBgColor = '#fff';
const initFgColor = '#000';

function QRCodeDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    { title: 'Content', name: 'value', extra: 'Default content to generate the QR code from' },
    { title: 'Size', name: 'size', initialValue: 128, render: <InputNumber min={60} /> },
    { title: 'Swatch color', name: 'fgColor', initialValue: initFgColor, render: <ColorPicker initialValue={initFgColor} /> },
    { title: 'Background color', name: 'bgColor', initialValue: initBgColor, render: <ColorPicker initialValue={initBgColor} /> },
    {
      title: 'Render mode',
      name: 'renderAs',
      initialValue: 'canvas',
      render: <RadioList optionType="button" buttonStyle="solid" options={MODE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(QRCodeDesigner);
