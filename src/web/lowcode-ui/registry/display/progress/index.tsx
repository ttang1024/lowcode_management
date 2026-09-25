import React from 'react';
import { Progress, type ProgressProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export interface RuntimeProps extends ProgressProps {
  value: number
}

export function ProgressRuntime({ value, ...props }: RuntimeProps) {
  const percent = value || props.percent || 0;
  return (
    <Progress {...props} width={props.style?.width as number} percent={percent} />
  );
}

export default component.runtime('progress', { type: 'display', valueType: 'number' })(
  ProgressRuntime,
);
