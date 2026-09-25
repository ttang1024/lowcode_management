import React, { useCallback, useMemo } from 'react';
import { Button, Confirm, fromButtonConfig } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { AbstractIcon } from 'lowcode-blocks';
import { useDispatchEventAction } from '../../hook';

const safeParse = (content: string, dv: any) => {
  try {
    return JSON.parse(content);
  } catch (ex) {
    console.error(ex);
    return dv;
  }
};

export interface RuntimeProps extends TableButtonModel {
  style?: React.CSSProperties
  value?: string | Record<string, any>
  valueMode?: 'string' | 'object'
  onChange?: (v: any) => void
}

export function ObjectInputRuntime({ icon, valueMode, ...props }: RuntimeProps) {
  const showConfirm = !!props.confirm;
  const eventer = useDispatchEventAction(props.event);

  const model = useMemo(() => {
    if (typeof props.value == 'string') {
      return safeParse(props.value, {});
    }
    return props.value || {};
  }, [valueMode, props.value]);

  const onClick = useCallback(() => {
    eventer.dispatch(model, (data, isCancel) => {
      if (isCancel) return;
      const value = valueMode === 'object' ? data : JSON.stringify(data);
      props.onChange?.(value);
    });
  }, [model, valueMode, props.onChange]);

  const node = (
    <Button
      {...fromButtonConfig(props)}
      style={props.style}
      onClick={showConfirm ? undefined : onClick}
      icon={icon ? <AbstractIcon type={icon} /> : undefined}
    >
      {props.title}
    </Button>
  );
  return showConfirm ? <Confirm title={props.confirm} danger={props.danger} onConfirm={onClick}>{node}</Confirm> : node;
}

export default component.runtime('object-input', { type: 'input' })(
  ObjectInputRuntime,
);
