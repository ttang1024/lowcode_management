import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteMatch } from 'lowcode-common';
import type { AppContextValue } from '../app-context';

export interface RouteParams {
  type: string
  app: string
  page: string
  id: string
}

export const usePageRoute = (context: AppContextValue, isDesign: boolean) => {
  const match = useRouteMatch<RouteParams>();
  const location = useLocation();
  return useMemo(() => {
    let pathname = location.pathname;
    const home = context?.config?.home;
    if (!match.params.page && home && !isDesign) {
      const [defaultPage] = home.replace(/^\//, '').split('/');
      // Updatemath.params.pagethe parameter is the default page
      match.params.page = defaultPage;
      pathname = (pathname + '/' + defaultPage + '/list').replace(/\/\//, '/');
    }

    return {
      page: match.params.page,
      app: match.params.app,
      pathname,
    };
  }, [context, isDesign]);
};
