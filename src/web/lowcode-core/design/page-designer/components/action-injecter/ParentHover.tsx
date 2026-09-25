import React, { useEffect, useRef } from 'react';
import { cn } from 'lowcode-kit';

export interface ParentHoverProps {
  className?: string
  parent?: 'parent-two' | 'default'
  findParent?: (element: HTMLElement) => HTMLElement
  mode?: 'opacity' | 'custom'
}

// Marks the region a toolbox belongs to while hovered, so the designer can
// outline what the tools will edit.
const HOT_CLASS = 'lc-design-hot';

/** A toolbox that appears while the pointer is over its parent region. */
export function ParentHover(props: React.PropsWithChildren<ParentHoverProps>) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const parent = props.findParent ? props.findParent(ref.current) : ref.current.parentElement;
    const runtime = { isEnter: false };
    const onEnter = () => {
      if (runtime.isEnter || !ref.current) return;
      runtime.isEnter = true;
      parent?.classList?.add(HOT_CLASS);
      if (props.mode == 'custom') {
        ref.current.classList.add('on-hover');
      } else {
        ref.current.style.opacity = '1';
      }
    };
    const onLeave = () => {
      runtime.isEnter = false;
      parent?.classList?.remove(HOT_CLASS);
      if (!ref.current) return;
      if (props.mode == 'custom') {
        ref.current.classList.remove('on-hover');
      } else {
        ref.current.style.opacity = '0';
      }
    };
    parent?.addEventListener?.('mousemove', onEnter);
    parent?.addEventListener?.('mouseleave', onLeave);
    return () => {
      parent?.classList?.remove(HOT_CLASS);
      parent?.removeEventListener?.('mousemove', onEnter);
      parent?.removeEventListener?.('mouseleave', onLeave);
    };
  }, []);

  const initialStyle = props.mode == 'custom' ? {} : { opacity: 0 };

  return (
    <span
      ref={ref}
      style={initialStyle}
      className={cn(
        'parent-hover-view z-10 inline-flex items-center gap-0.5 rounded-[11px] border border-indigo-100 bg-white p-[3px]',
        'shadow-[0_10px_24px_-10px_rgb(49_46_129/0.35),0_2px_6px_rgb(15_23_42/0.06)] transition-opacity duration-200',
        props.className,
      )}
    >
      {props.children}
    </span>
  );
};
