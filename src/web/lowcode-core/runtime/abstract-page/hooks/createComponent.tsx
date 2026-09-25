import dispatcher from '../../dispatcher';
import { component } from 'lowcode-registry';

function createStyle(style: ComponentCss, model: Record<string, any>) {
  if (!style) return undefined;
  const { fn, ...css } = style;
  let properties = null;
  const cssFn = dispatcher.fn.create<Record<string, string>>(fn, ['model']);
  if (fn && cssFn) {
    properties = cssFn(model);
  }
  if (properties && typeof properties == 'object') {
    return {
      ...css,
      ...properties,
    };
  }
  return css;
}

export default function createComponent(meta: ComponentModel, model: Record<string, any>, style: ComponentCss, props?: Record<string, any>, reason?: ComponentCreationReason) {
  const fnOptions = meta?.fnOptions;
  const handler = dispatcher.fn.create(fnOptions, ['model']);
  const options = handler ? handler(model || {}) : {};
  return component.create(
    meta,
    model,
    {
      ...(options || {}),
      ...(props || {}),
      style: createStyle(style, model),
    },
    model,
    reason,
  );
}

export function createAvariable<T>(fn: string, sign: string[]) {
  return dispatcher.fn.create<T>(fn, sign);
}