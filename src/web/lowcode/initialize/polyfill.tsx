import * as React from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import moment from 'moment';

// Low-code plugin bundles (built with lowcode-webpack-plugin) take React,
// ReactDOM and moment from these globals instead of bundling their own copy,
// so they share this app's single React instance. React 19 ships no UMD
// build, so the app bundles React and publishes it here. `react-dom/client`
// is merged into `ReactDOM` so both import paths resolve to one global.
const globals = window as any;
globals.React = React;
globals.ReactJSXRuntime = ReactJSXRuntime;
globals.ReactDOM = { ...ReactDOM, ...ReactDOMClient };
globals.moment = moment;
