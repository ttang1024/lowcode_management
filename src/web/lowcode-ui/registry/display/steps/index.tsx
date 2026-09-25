import React from 'react';
import { Steps, type StepsProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { AbstractIcon } from 'lowcode-blocks';

export interface StepItemOption {
  icon: string
  title: string
  subTitle: string
  description: string
  disabled: boolean
}

export interface RuntimeProps extends Omit<StepsProps, 'items'> {
  value: number
  disabled: boolean
  items: StepItemOption[]
}

export function StepsRuntime({ disabled, value, items, ...props }: RuntimeProps) {
  return (
    <Steps
      current={value}
      {...props}
      items={items?.map((item) => ({
        disabled,
        icon: item.icon ? <AbstractIcon type={item.icon} /> : undefined,
        title: item.title,
        subTitle: item.subTitle,
        description: item.description,
      }))}
    />
  );
}

export default component.runtime('steps', { type: 'display', valueType: 'number' })(
  StepsRuntime,
);
