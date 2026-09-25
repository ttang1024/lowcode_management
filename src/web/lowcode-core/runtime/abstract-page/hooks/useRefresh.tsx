import { useEffect } from 'react';

export default function useRefresh(data: PageConfigurerModel, onRefresh: (data: any) => void) {
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;

    const handleRefresh = ()=>{
      onRefresh?.({ refreshKeepPage: data.refreshKeepPage });
    };

    const onVisibilityChanged = () => {
      if (document.visibilityState == 'visible') {
        handleRefresh();
      }
    };

    const timeoutRefresh = () => {
      // Timed refresh; minimum is3s
      timerId = setInterval(handleRefresh, Math.max(data.refreshTimeout || 1, 3) * 1000);
    };
    const visibileRefresh = () => {
      //  Refresh on page visible
      document.addEventListener('visibilitychange', onVisibilityChanged);
    };
    switch (data?.refresh) {
      case 'timeout':
        timeoutRefresh();
        break;
      case 'visible':
        visibileRefresh();
        break;
      case 'both':
        timeoutRefresh();
        visibileRefresh();
        break;
    }
    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisibilityChanged);
    };
  }, [data?.refresh, data?.refreshKeepPage, onRefresh, data?.refreshTimeout]);
}