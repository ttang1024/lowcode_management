import { Oss } from 'lowcode-common';
import React, { useContext } from 'react';
import { cn } from 'lowcode-kit';
import AppContext from '../../../app-context';
import defaultLogo from '../../images/logo.png';

export interface LayoutLogoProps {
  className?: string
  style?: React.CSSProperties
}

export default function LayoutLogo(props: LayoutLogoProps) {
  const appContext = useContext(AppContext);
  const config = appContext.config;

  return (
    <div className={cn('layout-logo flex shrink-0 items-center justify-center', props.className)} style={props.style}>
      <img className="size-8 object-contain" alt="" src={Oss.getUrl(config?.logo || defaultLogo)} />
    </div>
  );
}
