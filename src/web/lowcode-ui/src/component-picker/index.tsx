import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { component } from 'lowcode-registry';
import { Cascader, type FormInstance } from 'lowcode-kit';
import type { ComponentRegistration } from 'lowcode-registry';
import JsxParameterInput from './JsxParameterInput';
import CSSPropertiesInput from './CSSPropertiesInput';
import TemplateInput from '../template-input';

export interface ComponentPickerProps {
  title?: string
  value?: ComponentModel
  parameter?: boolean
  renderExtra?: (recrod: any) => React.ReactNode
  onChange?: (value: ComponentModel) => void
}

const createOptions = (items: ComponentRegistration[]) => {
  return items?.map((item) => {
    return {
      label: item.name,
      value: item.name,
    };
  });
};

const useRegistrations = () => {
  const registrations = component.getAllRegistrations();
  return [
    {
      label: 'Input component',
      value: 'input',
      children: createOptions(registrations.filter((m) => m.type == 'input')),
    },
    {
      label: 'Display component',
      value: 'display',
      children: createOptions(registrations.filter((m) => m.type == 'display')),
    },
  ];
};

AbstractForm.registerConverter('cascader-component-name', {
  name: 'cascader-component-name',
  getValue(value) {
    return value instanceof Array ? value[1] || '' : '';
  },
  setInput(v) {
    const registration = component.getRegistration(v);
    return registration ? [registration.type, v] : [];
  },
});

function ComponentForm(props: { onCreated: (groups: string[]) => void, row: ComponentModel, value?: any, onChange?: (v: any) => void }) {
  const registration = component.getRegistration(props.row.name);
  const Designer = registration?.designer as React.FC<{ value: ComponentModel }>;
  const formRef = useRef<FormInstance>(null);

  useEffect(() => {
    if (formRef.current) {
      props.onCreated(Object.keys(formRef.current.getFieldsValue()));
    }
  }, [formRef.current]);

  return (
    <AbstractForm.ISolation
      value={props.value}
      onChange={props.onChange}
      groups={[]}
      form={formRef as any}
    >
      {Designer && <Designer value={props.value} />}
    </AbstractForm.ISolation>
  );
}

const ComponentValueTypeExtra = (props: { data: ComponentModel }) => {
  const registration = component.getRegistration(props.data?.name);
  if (!registration) return null;
  return (
    <div>
      Value type: <code>{registration.valueType || '-'}</code>
    </div>
  );
};

export default function ComponentPicker(props: ComponentPickerProps) {
  const cache = useRef({
    name: props.value?.name,
    cachedAllOptions: {
      [props.value?.name]: props.value?.options,
    },
  });
  const [parameters, setParameters] = useState<string[]>([]);
  const registrations = useRegistrations();

  const onCreated = (groups: string[]) => {
    setParameters(groups);
  };

  const onCache = useCallback((options) => {
    const ctx = cache.current;
    ctx.cachedAllOptions[ctx.name] = options;
  }, []);

  const groups: AbstractGroups<ComponentModel> = [
    {
      group: props.title ? `${props.title}Config` : '',
      items: [{
        title: 'Component',
        name: 'name',
        cascade: (name) => {
          cache.current.name = name;
          return {
            options: cache.current.cachedAllOptions[name] || {},
          };
        },
        convert: 'cascader-component-name',
        extra: (record) => {
          return (
            <>
              <ComponentValueTypeExtra data={record} />
              {props.renderExtra?.(record)}
            </>
          );
        },
        render: (
          <Cascader
            options={registrations}
            expandTrigger="hover"
            displayRender={(labels) => labels[labels.length - 1]}
          />
        ),
      },
      {
        title: 'Pass through',
        name: 'parameters',
        visible: () => props.parameter,
        extra: 'Specifies the params passed from the parent to the current component',
        render: (row) => <JsxParameterInput parameters={parameters} key={row.name} />,
      },
      {
        title: 'Component key',
        name: 'key',
        extra: 'React component key, controls whether the component is recreated, e.g. {age} or a literal',
        render: <TemplateInput />,
      },
      {
        title: '',
        name: 'options',
        onChange: onCache,
        visible: (row) => !!component.getRegistration(row.name)?.designer,
        render2: (row) => <ComponentForm key={row.name} onCreated={onCreated} row={row} />,
      },
      ],
    },
  ];

  return (
    <div className="component-form-container [&_.lc-form-group]:pr-0">
      <AbstractForm.ISolation
        value={props.value}
        onChange={props.onChange}
        groups={groups}
      />
    </div>
  );
}

ComponentPicker.CSSPropertiesInput = CSSPropertiesInput;