import type { HooksResponse } from 'lowcode-common/src/network/useQuery';
import { useEffect } from 'react';

export default function usePageSync(isDesign: boolean, api: HooksResponse<any>) {
  useEffect(() => {
    if (!isDesign) return;
    const onFocus = () => {
      if (document.visibilityState == 'visible') {
        if (api.status != 'loading') {
          api.refresh();
        }
      }
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [isDesign]);
}