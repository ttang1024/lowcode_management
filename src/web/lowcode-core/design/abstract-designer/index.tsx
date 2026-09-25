
import React, { type PropsWithChildren, useCallback, useRef } from 'react';
import LayoutDesigner from '../layout-designer';
import PageDesigner from '../page-designer';
import 'lowcode-ui/registry';

export interface AbstractDesignerProps<T, O> {
  // Type
  type: 'page' | 'layout'
  // the currently initialized config data
  data: T
  // the corresponding config data
  options: O
  // Triggered when the value changes; used for real-time updates
  onValuesChanged: (data: T) => void
  // when the design content changes
  onSubmit: (data: T, isRevert?: boolean) => void
  children: React.ReactNode
}

export type SubmitInterceptor<T> = (data: T) => void

export type UseSubmitHook<T> = (handler: SubmitInterceptor<T>) => void

export interface LowcodeNodeContextValue<T extends AbstractDesignerProps<any, any>> {
  // data
  data?: T['data']
  // Config property
  options?: T['options']
  // when the design content changes
  onSubmit?: T['onSubmit']
  // Triggered when the value changes; used for real-time updates
  onValuesChanged?: T['onValuesChanged']
  useSubmit?: UseSubmitHook<T['data']>
  clearSubmitInterceptors?: () => void
}

export type AbstractDesignerType<T> = React.FC<AbstractDesignerProps<T, any>>

export const components: Record<string, AbstractDesignerType<any>> = {
  'layout': LayoutDesigner,
  'page': PageDesigner,
};


export default function AbstractDesigner<T, O>(props: AbstractDesignerProps<T, O>) {
  const memo = useRef({ timerId: null });

  const onValuesChanged = useCallback((data: any) => {
    if (props.onValuesChanged) {
      clearTimeout(memo.current.timerId);
      memo.current.timerId = setTimeout(() => props.onValuesChanged(data), 180);
    }
  }, [props.onValuesChanged]);

  const ActualDesigner = components[props.type];

  if (!ActualDesigner) return null;

  return (
    <ActualDesigner
      data={props.data}
      type={props.type}
      options={props.options}
      onValuesChanged={onValuesChanged}
      onSubmit={props.onSubmit}
    >
      {props.children}
    </ActualDesigner>
  );
}

export class NeedUpdater extends React.Component<PropsWithChildren> {
  reason = '';

  /** Skip the next render: it only reflects a live edit the view already shows. */
  noticeUpdater() {
    this.reason = 'change';
  }

  /** Cancel a pending skip, so the next render (e.g. an action switch) applies. */
  clearNotice() {
    this.reason = '';
  }

  shouldComponentUpdate(): boolean {
    if (this.reason == 'change') {
      this.reason = '';
      return false;
    }
    return true;
  }

  render(): React.ReactNode {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}