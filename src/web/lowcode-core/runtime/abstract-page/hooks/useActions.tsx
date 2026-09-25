import React from 'react';
import { AbstractIcon } from 'lowcode-blocks';
import dispatcher from '../../dispatcher';
import { useHistory } from 'lowcode-common';
import type { ModelProps } from '../model';
import type { AbstractActionItemContext } from 'lowcode-blocks/src/interface';
import MyActionButton, { type RHistory } from '../components/MyActionButton';

function createActionButton(
  button: FormButtonModel,
  index: number,
  props: ModelProps,
  history: RHistory,
) {
  // eslint-disable-next-line react/display-name
  return (model, ctx: AbstractActionItemContext) => {
    return (
      <MyActionButton
        button={button}
        index={index}
        props={props}
        history={history}
        model={model}
        ctx={ctx}
      />
    );
  };
}

export default function useActions(
  config: PageConfigurerModel,
  props: ModelProps,
  isSubView = false,
): ActionConfigurerModel[] {
  const history = useHistory();
  const actionConfig = isSubView ? props.subActionConfig : props.actionConfig;
  const dynamicViews = actionConfig?.isDynamic ? [{ event: { action: actionConfig } }] : [];

  const buttons = [
    ...(config?.buttons?.filter((item) => item.event?.type == 'action' && item.event?.action) || []),
    ...dynamicViews,
  ] as PageInnerView[];

  const views = config?.views;
  const response = buttons?.map((item) => {
    const view = views?.find((m) => m.id == item.event?.action?.view);
    const { btnCancel, btnSubmit } = view || {};
    const actions = view?.buttons;
    const event = item.event;
    const footerActions = actions?.filter((m) => m.target != 'top').map((btn, i) => createActionButton(btn, i, props, history));
    const headerActions = actions?.filter((m) => m.target == 'top').map((btn, i) => createActionButton(btn, i, props, history));
    return {
      ...event.action,
      options: {
        isReadOnly: event.action.isReadOnly,
        title: dispatcher.fn.format(event.action?.title, props.record || {}),
        pageTitle: dispatcher.fn.format(event.action?.pageTitle, props.record || {}),
        subTitle: dispatcher.fn.format(event.action?.subTitle, props.record || {}),
        ...event.action?.options,
        btnCancel: {
          ...(btnCancel || {}),
          shape: btnSubmit?.shape,
          size: btnSubmit?.size || 'large', // value isundefined, rendered asdefault, (butabstract-objectspecified by the componentsizeislarge, isundefinedoverridden)
          icon: btnCancel?.icon ? <AbstractIcon type={btnCancel.icon as string} /> : null,
        },
        btnSubmit: {
          ...(btnSubmit || {}),
          style: { display: (btnSubmit?.hidden) ? 'none' : undefined },
          icon: btnSubmit?.icon ? <AbstractIcon type={btnSubmit.icon as string} /> : null,
        },
        className: `${view?.groupStyle || ''} abstract-page-design-view abstract-page-wrapper ${event.action.type}`,
        footActions: footerActions?.filter(Boolean),
        headActions: headerActions,
      },
      viewConfig: view,
    };
  });
  return response || [];
}