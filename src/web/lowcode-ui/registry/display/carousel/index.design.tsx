import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups, AdvanceUpload } from 'lowcode-blocks';
import { AutoComplete, Switch } from 'lowcode-kit';

const EASING = [
  { label: 'linear', value: 'linear' },
];

const FUNCTION = [
  { label: 'fade', value: 'fade' },
  { label: 'scrollx', value: 'scrollx' },
];

const POSITION = [
  { label: 'top', value: 'top' },
  { label: 'bottom', value: 'bottom' },
  { label: 'left', value: 'left' },
  { label: 'right', value: 'right' },
];

function CarouselDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Auto play',
      name: 'autoplay',
      render: <Switch />,
    },
    {
      title: 'Panel indicators',
      name: 'dots',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'Indicator position',
      name: 'dotPosition',
      render: <AutoComplete options={POSITION} />,
      visible: i => i.dots === true,
    },
    {
      title: 'Animation effect',
      name: 'easing',
      initialValue: 'linear',
      render: <AutoComplete options={EASING} />,
    },
    {
      title: 'Easing function',
      name: 'effect',
      extra: 'Animation easing function',
      initialValue: 'scrollx',
      render: <AutoComplete options={FUNCTION} />,
    },
    {
      title: 'Image list',
      name: 'items',
      render: <AdvanceUpload maxCount={8} />,
    },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(CarouselDesigner);
