import React from 'react';
import { component } from 'lowcode-registry';
import { dispatcher } from 'lowcode-core';

export interface RuntimeProps {
  text?: string
  value: string
  target: string
  href: string
  download: string
}

export function Link(props: RuntimeProps) {
  const creator = component.useCreator();
  const formatFn = dispatcher.fn.create<string>(props.href, ['model']);
  const href = formatFn?.(creator.model || {});

  return (
    <a href={href} target={props.target} download={ props.download ? props.download : undefined } >{props.text || props.value}</a>
  );
}

export default component.runtime('link', { type: 'display', valueType: 'string' })(Link);

