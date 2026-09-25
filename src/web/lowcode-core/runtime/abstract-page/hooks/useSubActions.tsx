import type { ModelProps } from '../model';
import useActions from './useActions';

export default function useSubActions(config:PageConfigurerModel, props:ModelProps) {
  const view = config?.views?.filter((item)=>item.type !== 'sub-view') || [];
  const buttons = [];
  view.forEach((item)=> buttons.push(...item.buttons));
  return useActions({ ...config, buttons }, props, true);
}