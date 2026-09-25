import { usePageNodeContext } from 'lowcode-core/design/lowcode-designer';
import { component } from 'lowcode-registry';
import { useCallback, useRef } from 'react';

export interface DispatchResponse<T = any> {
  canceled: boolean
  data?: T
}

export function useDispatchEventAction(event: EventConfigurerModel) {
  const context = component.useComponentContext();
  const pageNode = usePageNodeContext();
  const memo = useRef({ event: event });

  memo.current.event = event;

  const dispatch = useCallback((model: Record<string, any>, callback?: (data: any, isCancel: boolean) => void) => {
    return new Promise<DispatchResponse>((resolve, reject) => {
      const event = memo.current.event;
      const config = pageNode.data?.views?.find((m) => m.id == event?.action?.view);
      const isSubView = config?.type == 'sub-view';
      const options = {
        event: {
          closeOnSubmit: false,
          ...(event || {}),
          type: event.type,
          action: {
            closeOnSubmit: false,
            ...(event?.action || {}),
            isDynamic: true,
            noRoute: true,
            reloadType: [],
            noMessage: !event?.action?.successMessage,
            ignoreSubmitApiCheck: true,
            onCancel: () => {
              resolve({
                canceled: true,
              });
              callback?.(null, true);
            },
            onPostSubmit: (model, response) => {
              resolve({
                canceled: false,
                data: response || model,
              });
              callback?.(response || model, false);
            },
          },
        } as EventConfigurerModel,
      };
      Promise
        .resolve(context.dispatchButtonEvent(options, model, isSubView))
        .then(
          (response) => resolve({ canceled: false, data: response }),
          (error) => reject(error),
        );
    });
  }, []);

  return {
    dispatch,
    type: memo.current?.event?.type,
  };
}