/**
 * @module AbstractLayout
 * @description Abstract master-page component that renders the master view from the app system config
 */
import { AppContextService } from 'lowcode-services';
import React, { useContext, useEffect, useMemo } from 'react';
import { Spin } from 'lowcode-kit';
import { AbstractIcon, Exception } from 'lowcode-blocks';
import LowcodeDesigner, { DesignerContext } from '../../design/lowcode-designer';
import AppContext from '../app-context';
import { RegistryContext } from 'lowcode-registry';
import TopLayout from './template/TopLayout';
import DefaultLayout from './template/DefaultLayout';
import MixLayout from './template/MixLayout';
import dispatcher from '../dispatcher';

const layoutMappings = {
  'default': DefaultLayout,
  'top': TopLayout,
  'mix': MixLayout,
};

const interceptorHandler = async() => {
  dispatcher.configer.installApiResources();
  // must wait until environment variables are initialized before running
  return dispatcher.configer.installEnvConfig();
};

// Menus used to come from the SSO user's permissions; there is no menu source now that login is removed.
const NO_MENUS: AppMenu[] = [];

export interface AbstractLayoutProps extends React.PropsWithChildren {
}

export default function AbstractLayout(props: AbstractLayoutProps) {
  const showLayout = useContext(RegistryContext).layout != false;
  const response = AppContextService.useQuery().getAppWithCache(interceptorHandler);
  const designerContext = useContext(DesignerContext);
  const isDesign = designerContext.enable;
  const isOk = response.status == 'success';
  const { primaryColor } = response?.data || {};
  const status = response?.data?.status;
  const appContext = useMemo(() => {
    return {
      menus: NO_MENUS,
      config: response.data,
      children: props.children,
      menuTheme: response.data?.menuOptions?.theme || 'dark',
    };
  }, [response.data, props.children]);

  // The app's primary color drives the kit's accent (`--lc-primary`).
  useEffect(() => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty('--lc-primary', primaryColor);
    return () => {
      document.documentElement.style.removeProperty('--lc-primary');
    };
  }, [primaryColor]);

  switch (response.status) {
    case 'error':
      return <Exception type="500" onClick={response.refresh} desc={response.error?.message} title="App initialization failed" btnText="Click to retry" />;

    case 'loading':
      if (!isOk) {
        return <Spin delay={400} size="large" className="fixed inset-x-0 top-[120px]" />;
      }
      break;
  }

  if ((!isDesign && status !== 1)) {
    return <Exception type="404" title="App does not exist" btnText="" />;
  }

  const Layout = layoutMappings[response.data?.layout] || DefaultLayout;

  return (
    <LowcodeDesigner
      type="layout"
      options={{}}
      data={response.data}
      onSubmit={response.update}
      onValuesChanged={response.update}
    >
      <AppContext.Provider
        value={appContext}
      >
        <AbstractIcon.Provider value={{ url: response.data?.iconUrl }}>
          {
            isOk && (
              showLayout ? <Layout /> : props.children
            )
          }
        </AbstractIcon.Provider>
      </AppContext.Provider>
    </LowcodeDesigner>
  );
}
