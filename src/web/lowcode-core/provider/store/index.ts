import { init } from '@rematch/core';
import { Provider, connect } from 'react-redux';
import { createConnect, createPromiseAsync } from './redux';

// Initialize state
const store = init({
  plugins: [
    // The promise-async plugin (redux middleware) vs the @rematch/core
    // Plugin shape — compatible at runtime, reconciled at this boundary.
    createPromiseAsync('_Success', '_Error') as any,
  ],
});

const runtime = {
  currentPageModuleId: '',
};

/**
 * Get the current page store.model id
 */
function getPageModelId(app: string, page: string) {
  return `abstract-${app}-${page}`;
}

/**
 * Get the page status
 */
function getPageState() {
  return store.getState()[runtime.currentPageModuleId] || {} as Record<string, any>;
}

/**
 * Set the modelId of the current page
 */
function setPageModuleId(id:string) {
  runtime.currentPageModuleId = id;
}

export default {
  store,
  Provider,
  getPageModelId,
  getPageState,
  setPageModuleId,
  connect: createConnect(store, connect),
};
