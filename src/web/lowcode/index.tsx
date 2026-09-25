import './initialize';
import './initialize/shared';
import React from 'react';
import { createRoot } from 'react-dom/client';
import LowcodeApp from './App';
import Router from './router';
import registerPWA from './initialize/pwa';

document.getElementById('template-loading')?.classList?.add('hide-template');

createRoot(document.getElementById('lowcode_wrapper')).render(
  <LowcodeApp className="lowcode-admin-wrapper">
    <Router />
  </LowcodeApp>,
);

registerPWA('/service-worker.js');