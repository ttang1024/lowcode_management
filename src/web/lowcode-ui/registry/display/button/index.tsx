import React, { useCallback, useContext, useRef, useState } from 'react';
import { Button, Confirm, Space, fromButtonConfig } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { AbstractForm, AbstractIcon } from 'lowcode-blocks';
import { useDispatchEventAction } from '../../hook';

export interface ButtonValue {
  input?: any
  data?: any
}

export interface RuntimeProps extends TableButtonModel {
  style?: React.CSSProperties
  value?: ButtonValue
  input?: ComponentModel
  enter?: boolean
  needValidate?: boolean
  onChange?: (value: ButtonValue) => void
}

export function ButtonRuntime({ needValidate, icon, ...props }: RuntimeProps) {
  const showConfirm = !!props.confirm;
  const creator = component.useCreator();
  const [loading, setLoading] = useState(false);
  const eventer = useDispatchEventAction(props.event);
  const [input, setInput] = useState();
  const memo = useRef({ input: '' });
  const formCtx = useContext(AbstractForm.Context);

  const tryValidateForms = useCallback(() => {
    if (!needValidate) return;
    return formCtx.form?.current?.validateFields?.();
  }, [formCtx.form, needValidate]);

  const onClick = useCallback(async() => {
    memo.current.input = input;
    const isApi = eventer.type == 'api';
    isApi && setLoading(true);
    try {
      await tryValidateForms();
      const response = await eventer.dispatch({
        input: input,
        record: creator.model,
      });
      if (!response.canceled) {
        props.onChange?.({
          data: response.data?.result,
          input: memo.current.input,
        });
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  }, [creator.model, input, tryValidateForms]);

  const onChange = useCallback((e) => {
    const v = e?.target ? e.target.value : e;
    setInput(v);
  }, []);

  const node = (
    <Button
      {...fromButtonConfig(props)}
      style={props.style}
      loading={loading}
      onClick={showConfirm ? undefined : onClick}
      icon={icon ? <AbstractIcon type={icon} /> : undefined}
    >
      {props.title}
    </Button>
  );
  const button = showConfirm ? <Confirm title={props.confirm} danger={props.danger} onConfirm={onClick}>{node}</Confirm> : node;

  const onKeyEnter = (e) => {
    if (e.key == 'Enter') {
      onClick();
    }
  };

  if (!props.input) {
    return button;
  }

  return (
    <Space.Compact block>
      <div className="min-w-0 flex-1">
        {component.create(
          props.input,
          creator.model,
          {
            onChange: onChange,
            value: input,
            onKeyUp: props.enter ? onKeyEnter : undefined,
          },
          creator.model,
          {
            type: 'ButtonInput',
            item: {},
          })}
      </div>
      {button}
    </Space.Compact>
  );
}

export default component.runtime('button', { valueType: '{ input:"",data:{} }', type: 'display' })(
  ButtonRuntime,
);
