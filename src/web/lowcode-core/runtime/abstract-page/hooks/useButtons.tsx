import React, { useCallback } from 'react';
import { type AbstractButtons, AbstractIcon } from 'lowcode-blocks';
import type { AbstractButton } from 'lowcode-blocks/src/abstract-table/types';
import { toast } from 'lowcode-kit';
import type { ModelProps } from '../model';
import { useHistory } from 'lowcode-common';
import { createAvariable } from './createComponent';


export default function useButtons(
  buttons: TableButtonModel[],
  props: ModelProps,
) {
  const history = useHistory();

  const dispatchEvent = useCallback((button: { event?: EventConfigurerModel }, row: any, isSubview = false) => {
    const event = button.event;
    switch (event?.type) {
      case 'action':
        if (!event?.action?.view) {
          toast.info('You have not configured a view yet');
          break;
        } else if (event?.action?.noRoute) {
          if (isSubview) {
            return props.enterSubAction({
              payload: { model: row, action: event.action.name, id: '' },
              config: event.action,
            });
          }
          props.enterAction({
            payload: { model: row, action: event.action.name, id: '' },
            config: event.action,
          });
        }
        break;
      case 'api':
        return new Promise<void>((resolve, reject) => {
          props.onCallApi({
            row,
            event,
            callback: (ex, response) => {
              ex ? reject(ex) : resolve(response);
            },
          });
        });
      case 'link':
        props.navigate({ event, row, history });
        break;
      default:
        if (!event?.type) {
          toast.info('Missing event config');
        }
        break;
    }
  }, [props.navigate, props.onCallApi]);


  const response = buttons?.map((item) => {
    const avariable = createAvariable<ButtonAvariableInfo>(item.avariable, ['model']);
    const event = item.event;
    const button: AbstractButton<any> = {
      title: item.title,
      confirm: item.confirm,
      tip: item.tip,
      icon: item.icon ? <AbstractIcon type={item.icon} /> : undefined,
      target: item.target as any,
      select: item.select,
      shape: item.shape,
      size: item.size,
      danger: item.danger,
      ghost: item.ghost,
      type: item.type,
      visible: avariable ? (model) => avariable(model)?.visible != false : undefined,
      disabled: avariable ? (model) => avariable(model)?.disabled : undefined,
    };
    if (event?.type == 'action' && event?.action?.noRoute !== true) {
      button.action = event.action?.name;
    } else {
      button.click = (row) => dispatchEvent(item, row);
    }
    return button;
  });

  return {
    buttons: (response || []) as AbstractButtons<any>,
    dispatchEvent,
  };
}