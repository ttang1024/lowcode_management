import React from 'react';
import { Rate, type RateProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { AbstractIcon } from 'lowcode-blocks';

export type RuntimeProps = RateProps

export function RateRuntime(props: RuntimeProps) {
  const character = props.character ? <AbstractIcon type={props.character as string} /> : undefined;
  return <Rate {...props} character={character} />;
}

export default component.runtime('rate', { type: 'input', valueType: 'number' })(RateRuntime);
