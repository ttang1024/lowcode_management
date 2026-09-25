import React from 'react';
import { Switch } from 'lowcode-kit';
import { AbstractForm, AdvanceUpload, OptionsPicker } from 'lowcode-blocks';
import type {
  AbstractGroups,
  AbstractRules,
  RecordViewProps,
} from 'lowcode-blocks/src/interface';
import BlockCheckbox from '../components/BlockCheckbox';
import ThemeColor from '../components/ThemeColor';

import InputNumber from 'lowcode-ui/registry/input/input-number';

export interface AppRecordProps
  extends RecordViewProps<AppConfigurerModel> { }

export default function AppRecord(_props: AppRecordProps) {
  // Validation rules
  const rules: AbstractRules = {
    name: [{ required: true, message: 'Please enter the system name' }],
  };

  const layoutList = [
    {
      key: 'side',
      title: 'Side menu layout',
    },
    {
      key: 'top',
      title: 'Top menu layout',
    },
    {
      key: 'mix',
      title: 'Mixed menu layout',
    },
  ];

  // Form
  const groups: AbstractGroups<AppConfigurerModel> = [
    { title: 'System name', name: 'name' },
    {
      group: 'Navigation config',
      items: [
        {
          title: 'Navigation mode',
          name: 'layout',
          initialValue: 'side',
          render: () => (
            <BlockCheckbox
              list={layoutList}
              key="layout"
              configType="layout"
              value=""
            />
          ),
        },
        {
          title: 'Collapsible',
          name: 'menuOptions.collapsible',
          initialValue: true,
          render: () => <Switch />,
        },
        {
          title: 'Collapsed by default',
          name: 'menuOptions.defaultCollapsed',
          initialValue: true,
          extra: 'When the menu is collapsible, controls whether it starts expanded or collapsed',
          visible: (r) => r.menuOptions?.collapsible !== false,
          render: () => <Switch />,
        },
        {
          title: 'Small icon',
          name: 'menuOptions.miniIcon',
          initialValue: false,
          extra: 'Show only small icons when collapsed',
          visible: (r)=> r.menuOptions?.collapsible != false,
          render: () => <Switch />,
        },
        {
          title: 'Navigation theme',
          name: 'menuOptions.theme',
          initialValue: 'dark',
          render: () => <OptionsPicker optionsKey={'lowcode_nav_themes'} />,
        },
        {
          title: 'Width',
          name: 'menuOptions.width',
          initialValue: 200,
          visible: (r)=> r.layout != 'top',
          render: () => <InputNumber min={80} max={400} />,
        },
        {
          title: 'Collapsed width',
          name: 'menuOptions.collpasedWidth',
          initialValue: 98,
          visible: (r)=> r.menuOptions?.collapsible != false,
          render: () => <InputNumber min={60} max={200} />,
        },
      ],
    },
    {
      group: 'Appearance theme',
      items: [
        {
          title: 'Logo',
          name: 'logo',
          render: (
            <AdvanceUpload maxCount={1} />
          ),
        },
        {
          title: 'Theme color',
          name: 'primaryColor',
          render: () => <ThemeColor value="" />,
        },
      ],
    },
  ];

  // Render
  return (
    <>
      <AbstractForm
        rules={rules}
        groups={groups}
      />
    </>
  );
}
