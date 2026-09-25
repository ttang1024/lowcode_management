import React, { useContext } from 'react';
import { cn } from 'lowcode-kit';
import AppContext from '../../../app-context';

export interface TitleProps {
  className?: string
  style?: React.CSSProperties
}

export default function Title(props: TitleProps) {
  const appCtx = useContext(AppContext);
  const config = appCtx.config;

  if (!config.name) return null;

  return (
    <div
      style={props.style}
      title={`${config.name} (core: v${process.env.VERSION || ''})`}
      className={cn('app-title overflow-hidden font-semibold whitespace-nowrap select-none', props.className)}
    >
      {config.name}
    </div>
  );
}
