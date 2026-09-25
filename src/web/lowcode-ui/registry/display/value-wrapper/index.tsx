
import React from 'react';

export type ValueComponent<P> = React.FC<P> | React.ComponentType<P> | React.ComponentClass


export interface ValueWrapperProps<P> {
  component:ValueComponent<P>
  valueKey: string
  value: any
}


export default function ValueWrapper<P>({ valueKey, value, component, ...props }:ValueWrapperProps<P>) {
  const attr = {} as Record<string, any>;
  attr[valueKey] = value || props[valueKey];
  const Component = component;
  return <Component {...(props as any as P)} {...attr} />;
}

ValueWrapper.create = function createValueWrapper<P>(name: string, component: ValueComponent<P>) {
  return function ValueForward(props: ValueWrapperProps<P> & P) {
    return <ValueWrapper {...props} valueKey={name} component={component} />;
  };
};
