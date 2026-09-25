import React from 'react';
import { Input, Switch } from 'lowcode-kit';
import { AbstractForm, type AbstractGroups, RadioList } from 'lowcode-blocks';
import router from 'lowcode-core/runtime/dispatcher/router';

const TYPES = [{ label: 'Fixed value', value: 'constant' }, { label: 'route', value: 'route' }, { label: 'None', value: 'none' }];

export interface InitialValueSettingProps {
  value?: SearchDefaultOptions;
  onChange?: (value: SearchDefaultOptions) => void;
}

export function getInitialValue(data: SearchDefaultOptions) {
  const { type, constant, route } = data || {};
  let value = undefined;
  if (type === 'constant' && constant) {
    value = constant;
  }

  if (type === 'route' && route) {
    const parsed = router.getRoute();
    value = parsed[route];
  }

  if (data?.isArray) {
    value = String(value).split(',');
  }

  return value;
}

export default function InitialValueSetting({ ...props }: InitialValueSettingProps) {
  const groups: AbstractGroups<SearchDefaultOptions> = [
    {
      title: 'Default value',
      name: 'type',
      initialValue: 'none',
      render: <RadioList style={{ width: 300 }} size="middle" optionType="button" buttonStyle="solid" options={TYPES} />,
    },
    {
      title: 'Fixed value',
      name: 'constant',
      visible: (model) => model.type == 'constant',
      render: <Input />,
    },
    {
      title: 'Field name',
      name: 'route',
      visible: (model) => model.type == 'route',
      render: <Input />,
    },
    {
      title: 'Array',
      name: 'isArray',
      extra: 'Split the value parsed from the url into an array by ","',
      visible: (model) => model.type == 'route',
      render: <Switch />,
    },
  ];

  return <AbstractForm.ISolation {...props} groups={groups} />;
}
