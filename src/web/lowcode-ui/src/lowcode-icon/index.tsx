import React from 'react';
import { cn } from 'lowcode-kit';
import './icon/iconfont.js';

export interface LowcodeIconProps {
  type: string
  className?: string
}

/** Icon from the bundled `gy-*` SVG sprite. */
export default function LowcodeIcon(props: LowcodeIconProps) {
  return (
    <svg className={cn('lowcode inline-block size-[1em] cursor-pointer overflow-hidden fill-current text-center align-middle', props.className)} fill="currentColor">
      <use xlinkHref={`#${props.type}`} fill="currentColor"></use>
    </svg>
  );
}
