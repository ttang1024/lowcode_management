import './initialize';
import './initialize/shared.runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import LowcodeApp from './App';
import Router from './router/index.runtime';
import { type RegistryContextValue, registerApplication } from 'lowcode-registry';
import 'lowcode-ui/registry/runtime';
import registerPWA from './initialize/pwa';

document.getElementById('template-loading')?.classList?.add('hide-template');

const root = document.getElementById('lowcode_wrapper');

interface IProps {
  ctx?: RegistryContextValue
}

export default function RunApplication(props: IProps) {
  return (
    <LowcodeApp className="lowcode-runtime-wrapper">
      <Router ctx={props.ctx} />
    </LowcodeApp>
  );
}

// Register the app container component
registerApplication(RunApplication);

if (root) {
  // if a render node exists, render it
  const ctx = {
    // legacy config; oncegy-workorderis refactored and shipped, this can be removed
    ...((window as any).LOWCODE_CHILD_APP || {}),
  } as RegistryContextValue;
  createRoot(root).render(<RunApplication ctx={ctx} />);
}

registerPWA('/public/service-worker.js?mode=runtime');