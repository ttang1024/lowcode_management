import React from 'react';
import { Result } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { GwImage } from 'lowcode-blocks';

export interface RuntimeProps {
  status?: string
  title?: React.ReactNode
  subTitle?: React.ReactNode
  extra?: React.ReactNode
  icon: string
  style?: React.CSSProperties
}

export function ResultRuntime({ icon, ...props }: RuntimeProps) {
  return (
    <Result
      {...props}
      icon={icon ? <GwImage src={icon} preview={false} /> : undefined}
    />
  );
}

export default component.runtime('result', { type: 'display' })(ResultRuntime);
