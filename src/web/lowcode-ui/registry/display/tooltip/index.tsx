import React from 'react';
import { Tooltip, type TooltipProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = Omit<TooltipProps, 'children'> & {
  value: string
  children: any
  style?: React.CSSProperties
}

export function TooltipRuntime({ value, children, style, ...props }: RuntimeProps) {
  return (
    <Tooltip {...props} title={value}>
      <span style={style}>
        {value || children || ''}
      </span>
    </Tooltip>
  );
}

export default component.runtime('tooltip', { type: 'display', valueType: 'string' })(
  TooltipRuntime,
);
