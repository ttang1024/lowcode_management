import { useEffect } from 'react';


export function useAutomaticTitle(config: PageConfigurerModel, action: ActionConfigurerModel) {
  useEffect(() => {
    const hasTopActions = (config?.buttons || []).find((m) => m.target === 'top');
    if (hasTopActions || action?.type === 'object') {
      document.body.classList.add('force-show-extra');
    } else {
      document.body.classList.remove('force-show-extra');
    }
    return () => {
      document.body.classList.remove('force-show-extra');
    };
  }, [config?.appCode, config?.code, config?.buttons, action]);
}