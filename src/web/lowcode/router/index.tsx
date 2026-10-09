import React, { useMemo } from 'react';
import {
  Routes, Route, Navigate, BrowserRouter, MemoryRouter,
  UNSAFE_LocationContext as LocationContext, UNSAFE_RouteContext as RouteContext,
} from 'react-router-dom';
import loadable from '@loadable/component';
import { NotFoundView } from 'lowcode-blocks';
import { AbstractLayout, LowcodeDesigner, AbstractPage } from 'lowcode-core';
import Layout from '../layouts';
import DesignerShell from '../layouts/DesignerShell';
import AuthGate from '../layouts/AuthGate';
import { PopupRoute } from 'lowcode-ui';
import { RegistryContext, type RegistryContextValue } from 'lowcode-registry';
import { openDiffer } from 'lowcode-ui/src/diff-view';
import config from 'lowcode-configs';

const Overview = loadable(() => import(/* webpackChunkName: "overview" */ '../pages/Overview'));
const App = loadable(() => import(/* webpackChunkName: "app" */ '../pages/App'));
const AppPage = loadable(() => import(/* webpackChunkName: "apppage" */ '../pages/AppPage'));
const Options = loadable(() => import(/* webpackChunkName: "options" */ '../pages/Options'));
const Apis = loadable(() => import(/* webpackChunkName: "options" */ '../pages/Apis'));
const Functions = loadable(() => import(/* webpackChunkName: "options" */ '../pages/Functions'));
const EnvVariables = loadable(() => import(/* webpackChunkName: "resource" */ '../pages/EnvVariables'));

const resolveConflict = async(cache: PageConfigurerModel, latest: PageConfigurerModel) => {
  return new Promise<PageConfigurerModel>((resolve) => {
    openDiffer({
      title: 'A new server version was detected',
      leftTitle: `Local (version ${cache.version})`,
      rightTitle: `Server (version ${latest.version})`,
      oldValue: JSON.stringify(cache, null, 2),
      newValue: JSON.stringify(latest, null, 2),
      closable: false,
      onSubmit: (content: string) => {
        const data = JSON.parse(content) as PageConfigurerModel;
        data.version = latest.version;
        resolve(data);
      },
    });
  });
};

function AppContext(props: React.PropsWithChildren<{ ctx?: RegistryContextValue }>) {
  const ctx = useMemo<RegistryContextValue>(() => ({
    name: '',
    isAdmin: true,
    appId: config.APP_TYPE,
    ...props.ctx,
  }), []);

  return (
    <RegistryContext.Provider value={ctx}>
      {props.children}
    </RegistryContext.Provider>
  );
}

function DesignArea() {
  return (
    <DesignerShell>
      <LowcodeDesigner.Provider value={{ enable: true, resolveConflict }}>
        <AbstractLayout>
          <Routes>
            <Route path=":app/:page/:action?/:id?" element={<AbstractPage />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </AbstractLayout>
      </LowcodeDesigner.Provider>
    </DesignerShell>
  );
}

function AdminArea() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="app/:action?/:id?" element={<App />} />
        <Route path=":app/page/:action?/:id?" element={<AppPage />} />
        <Route path="options/:action?/:id?" element={<Options />} />
        <Route path="apis/:action?/:id?" element={<Apis />} />
        <Route path="functions/:action?/:id?" element={<Functions />} />
        <Route path="env/:action?/:id?" element={<EnvVariables />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </Layout>
  );
}

export default function ReduxRouter() {
  return (
    <BrowserRouter>
      <AppContext>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/design/*" element={<AuthGate><DesignArea /></AuthGate>} />
          <Route path="/admin/*" element={<AuthGate><AdminArea /></AuthGate>} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </AppContext>
    </BrowserRouter>
  );
}

// The popup dialog renders inside the app's BrowserRouter, and React Router refuses to nest
// routers. Clear the parent location and route contexts so the MemoryRouter below starts fresh
// and its routes match absolute paths rather than relative to the outer route.
const ROOT_ROUTE_CONTEXT = { outlet: null, matches: [], isDataRoute: false };

PopupRoute.register((pathname: string) => {
  const location = { state: {}, pathname };
  return (
    <LocationContext.Provider value={null}>
      <RouteContext.Provider value={ROOT_ROUTE_CONTEXT}>
        <MemoryRouter initialEntries={[location]} initialIndex={0}>
          <Routes>
            <Route path="/admin/options/:action?/:id?" element={<Options />} />
            <Route path="/admin/apis/:action?/:id?" element={<Apis />} />
          </Routes>
        </MemoryRouter>
      </RouteContext.Provider>
    </LocationContext.Provider>
  );
});
