import './polyfill';
import config from 'lowcode-configs';
import { toast } from 'lowcode-kit';
import { Network, Config, BizError } from 'lowcode-common';
import type { GeneralResult } from 'lowcode-api/framework';

// Global config
Config.setup({
  fileGateway: {
    data: { bizId: 'lowcode', storeDir: 'lowcode-web' + config.OSS_SUFFIX },
    // File upload URL
    uploadUrl: config.FILEGW,
    // File access URL
    url: config.CDN,
  },
});

// Async request result
const pullAsyncApiResult = async(response: GeneralResult, asyncApi: ApiConfigurerModel) => {
  const network = new Network();
  const asyncKey = String(response?.result || response?.asyncKey);
  const isAsyncApi = asyncKey.indexOf('asynccall') > -1;
  if (!isAsyncApi) {
    // if it is not an async API
    return response;
  }
  // Async result polling
  const pullUrls = {
    // Legacy async API
    'async-call': 'async-call/store/publicResult',
    // New async API
    'async-result': 'async-result/async/call/getAsyncResult',
  };
  const pullUrl = pullUrls[asyncApi?.pullMode || 'async-call'];
  const params = { key: asyncKey };
  const needReTry = (response: GeneralResult) => {
    return String(response.errorCode) === '61000';
  };
  const defaultMax = 5;
  const defaultDelay = 1000;
  // Retry 5 times by default
  const max = Math.max((asyncApi?.pullCount || defaultMax) - 1, 1);
  // Default interval 1 second
  const delay = asyncApi.pullDelay || defaultDelay;
  return network.post<GeneralResult>(pullUrl, params).try(max, needReTry, delay).json().silent();
};

// Initialize the HTTP client
Network
  .config({
    base: config.API,
    contentType: 'application/json',
    loading: (text?: string) => toast.loading(text || 'Loading…'),
  })
  .on('error', (e: BizError) => {
    const description = e.data?.errorMsg || e.message || '';
    toast.error('Request failed', description || 'The network request failed. Please try again.');
  })
  .on('response', async(response: GeneralResult, context) => {
    // if the returned content is notjson then skip
    if (context.responseConvert !== 'json') return response;
    // A body of `null` (or a non-object) has no success flag to check.
    const success = response && typeof response === 'object' && 'success' in response ? response.success : true;
    // Async API support
    response = await pullAsyncApiResult(response, context.extra?.asyncApi);
    return success ? response : Promise.reject(new BizError(response.errorCode, response.errorMsg));
  });