import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Router from './Router';
import { AbstractLayout, AbstractPage, LowcodeDesigner } from 'lowcode-core';
import { RegistryContext, type RegistryContextValue, ApplicationRunner } from 'lowcode-registry';
import { AppContextService } from 'lowcode-services';
import config from 'lowcode-configs';

/**
 * A published page's route is `/:app/:page/...`, so the app code is the first
 * path segment. With a hash router it lives in `location.hash`. Links saved
 * before pages moved off `/public` still carry that prefix, so it is skipped.
 */
function resolvePublicAppName(isHashRouter?: boolean) {
  const source = isHashRouter ? location.hash.replace(/^#/, '') : location.pathname;
  return source.replace(/^\/public(?=\/)/, '').match(/^\/([^/?#]+)/)?.[1] || '';
}

/** Sends a legacy `/public/...` link to the same page without the prefix. */
function LegacyPublicRedirect() {
  const location = useLocation();
  const to = location.pathname.replace(/^\/public(?=\/|$)/, '') || '/';
  return <Navigate to={{ pathname: to, search: location.search, hash: location.hash }} replace />;
}

/**
 * Runtime content: the published page (`/:app/...`) and the fallback runtime
 * container coexist. The page renders only on a page route (so its URL params
 * resolve), while the fallback is always mounted and toggled via display.
 */
function RuntimeContent() {
  const location = useLocation();
  const isPage = location.pathname !== '/';

  useEffect(() => {
    if (!isPage) {
      document.body.classList.remove('force-show-extra');
    }
  }, [isPage]);

  return (
    <>
      <Routes>
        <Route path="/public/*" element={<LegacyPublicRedirect />} />
        <Route path="/:app/:page?/:action?/:id?" element={<AbstractPage />} />
      </Routes>
      <ApplicationRunner.FallbackContainer style={{ display: isPage ? 'none' : 'block' }} />
    </>
  );
}

export default function ReduxRouter(props: { ctx: RegistryContextValue }) {
  const enableDesign = props.ctx.design && props.ctx.isDebug;
  const ctx = useMemo<RegistryContextValue>(() => {
    const merged: RegistryContextValue = {
      appId: config.APP_TYPE,
      ...props.ctx,
      // Seed the app code from the URL so the singleton AppContextService can
      // resolve the app config; without it the public runtime never learns the
      // app name and renders "App does not exist".
      name: props.ctx?.name || resolvePublicAppName(props.ctx?.isHashRouter),
    };
    AppContextService.initializeContext(merged);
    return merged;
  }, []);

  return (
    <Router isHashRouter={props.ctx?.isHashRouter}>
      <RegistryContext.Provider value={ctx}>
        <LowcodeDesigner.Provider value={{ enable: enableDesign }}>
          <AbstractLayout>
            <RuntimeContent />
          </AbstractLayout>
        </LowcodeDesigner.Provider>
      </RegistryContext.Provider>
    </Router>
  );
}
