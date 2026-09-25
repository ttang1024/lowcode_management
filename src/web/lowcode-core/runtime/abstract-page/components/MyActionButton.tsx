import React, { useState } from 'react';
import { createAvariable } from '../hooks/createComponent';
import type { ModelProps } from '../model';
import type { AbstractActionItemContext } from 'lowcode-blocks/src/interface';
import { Button, Confirm, fromButtonConfig, toast, type ButtonProps } from 'lowcode-kit';
import { AbstractIcon } from 'lowcode-blocks';
import type { useHistory } from 'lowcode-common';

export type RHistory = ReturnType<typeof useHistory>

export interface MyActionButtonProps {
  button: FormButtonModel,
  index: number,
  props: ModelProps,
  history: RHistory
  model: any
  ctx: AbstractActionItemContext
}

export default function MyActionButton(myProps: MyActionButtonProps) {
  const { index, button, history, model, ctx, props } = myProps;
  const [loading, setLoading] = useState(false);
  const avariable = createAvariable<ButtonAvariableInfo>(button.avariable, ['model']);
  const status = avariable ? avariable(model) : {} as ButtonAvariableInfo;
  // the button is hidden

  if (status?.visible == false) return null;
  const options: Partial<ButtonProps> = {
    ...fromButtonConfig(button),
    disabled: status?.disabled == true,
    icon: button.icon ? <AbstractIcon type={button.icon} /> : undefined,
    onClick: () => {
      const event = button?.event;
      if (!event?.type) {
        toast.warning('Missing event config');
        return;
      }
      switch (event?.type) {
        case 'action':
          // eslint-disable-next-line react/prop-types
          props.enterSubAction({
            payload: { action: event.action.name, id: '' },
            config: event.action,
          });
          break;
        case 'api':
          setLoading(true);
          // eslint-disable-next-line react/prop-types
          props.onCallApi({ isAction: true, event, row: model, callback: () => {setLoading(false);} });
          break;
        case 'link':
          if (event.back) {
            // if it is the return type
            return ctx.cancel();
          }
          // eslint-disable-next-line react/prop-types
          props.navigate({ event, history, row: model });
          break;
      }
    },
  };

  if (button.needValidate) {
    options.onClick = ctx.bindValidate(options.onClick);
  }

  const btnStyle = {
    borderColor: button.backgroundColor,
    backgroundColor: button.backgroundColor,
    color: button.color,
  };

  if (button.needConfirm) {
    const onClick = options.onClick;
    delete options.onClick;
    return (
      <Confirm key={index} title={button.confirm} danger={button.danger} onConfirm={() => onClick?.(undefined as any)}>
        <Button {...options} style={btnStyle} loading={loading} >
          {button.shape == 'circle' ? '' : button.title}
        </Button>
      </Confirm>
    );
  }
  return (
    <Button {...options} key={index} style={btnStyle} loading={loading}>
      {button.shape == 'circle' ? '' : button.title}
    </Button>
  );
}