import React, { useCallback, useContext, useRef, useState } from 'react';
import { Confirm, Switch, type SwitchProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { dispatcher } from 'lowcode-core';
import { useParams } from 'react-router-dom';

export interface RuntimeProps extends SwitchProps {
  event: EventConfigurerModel
  yesConfirm?: string
  noConfirm?: string
  value?: boolean
}

export function SwitchRuntime({ event, yesConfirm, noConfirm, ...props }: RuntimeProps) {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [open, setOpen] = useState(false);
  const memo = useRef({ resolve: null as null | ((ok: boolean) => void) });
  const creator = useContext(component.CreatorContext);
  const cContext = component.useComponentContext();

  const doApi = useCallback(async(checked) => {
    if (event?.api) {
      try {
        setLoading(true);
        const context = { model: creator.model, checked };
        const response = await dispatcher.api.callApi(event.api, context, params);
        cContext.apiResponse({ response, closeOnSubmit: event.closeOnSubmit, refresh: event.reloadType, message: event.apiMessage });
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  }, [event]);

  const onChange = useCallback(async(checked: boolean) => {
    // Ask first when a confirmation text is configured for this direction.
    const ok = await new Promise<boolean>((resolve) => {
      const message = checked ? yesConfirm : noConfirm;
      if (message) {
        memo.current.resolve = resolve;
        setOpen(true);
      } else {
        resolve(true);
      }
    });
    if (!ok) return;
    await doApi(checked);
    props.onChange?.(checked);
  }, [doApi, yesConfirm, noConfirm, props.onChange]);

  const settle = (ok: boolean) => {
    setOpen(false);
    memo.current.resolve?.(ok);
    memo.current.resolve = null;
  };

  const checked = 'checked' in props ? props.checked : props.value;

  return (
    <Confirm
      title={checked ? noConfirm : yesConfirm}
      disabled
      open={open}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    >
      <Switch
        {...props}
        checked={checked}
        loading={loading}
        onChange={onChange}
      />
    </Confirm>
  );
}

export default component.runtime('switch', { type: 'input', valueType: 'boolean' })(SwitchRuntime);
