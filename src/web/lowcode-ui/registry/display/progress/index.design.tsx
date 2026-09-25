import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import { InputNumber, Switch } from 'lowcode-kit';
import ColorPicker from '../../../src/color-picker';

const TYPE = [
  { label: 'Ring', value: 'circle' },
  { label: 'Line', value: 'line' },
  { label: 'Dashboard', value: 'dashboard' },
];

const STYLE = [
  { label: 'round', value: 'round' },
  { label: 'butt', value: 'butt' },
  { label: 'square', value: 'square' },
];

function ProgressDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Type',
      name: 'type',
      initialValue: 'line',
      render: <RadioList optionType="button" buttonStyle="solid" options={TYPE} />,
    },
    {
      title: 'Percentage',
      name: 'percent',
      extra: 'For debugging; by default renders progress based on the passed-in value',
      render: <InputNumber min={50} />,
    },
    {
      title: 'Details',
      name: 'showInfo',
      extra: 'Whether to show the progress value or status icon',
      render: <Switch />,
    },
    {
      title: 'Fill color',
      name: 'strokeColor',
      extra: 'Progress bar color',
      render: <ColorPicker />,
    },
    {
      title: 'Track color',
      name: 'trailColor',
      render: <ColorPicker />,
    },
    {
      title: 'Style',
      name: 'strokeLinecap',
      initialValue: 'linear',
      render: <RadioList optionType="button" buttonStyle="solid" options={STYLE} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(ProgressDesigner);
