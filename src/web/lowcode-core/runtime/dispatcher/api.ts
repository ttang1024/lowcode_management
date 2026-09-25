import { Network } from 'lowcode-common';
import fn from './function';
import router from './router';
import config from './config';
import { toast } from 'lowcode-kit';
import { store } from '../../provider';
import { ResourceService } from 'lowcode-services';

interface Model { [x: string]: any }

interface RequestFormater {
  query: Record<string, any>
  body: Record<string, any>
  cancel: boolean
}

function prepareParameters(api: ApiConfigurerModel, context: Model, params: Model, allIn: Model, page: Record<string, any>, options: Record<string, any>) {
  const parsed = router.getRoute();
  const requestFormatFunction = api.values?.requestFormatFunction;
  const route = { ...params, ...parsed };
  if (!requestFormatFunction) {
    return {
      query: {},
      body: { ...allIn },
    };
  }
  const data = fn.exec(requestFormatFunction, ['context', 'route', 'page', 'options'], [context, route, page, options || {}], true) || {} as RequestFormater;
  return {
    query: data?.query || {},
    body: {
      ...allIn,
      ...(data?.body || {}),
    },
    // whether to cancel the current API call and return an empty object instead
    cancel: data.cancel,
  };
}

function execResponseFunction(api: ApiConfigurerModel, res: any, context: Model, route: Model, page: Record<string, any>, options: Record<string, any>) {
  const responseFormatFunction = api?.values?.responseFormatFunction;
  if (responseFormatFunction) {
    if (responseFormatFunction.startsWith('function')) {
      return fn.exec(`return ${responseFormatFunction}`, ['response', 'context', 'route', 'page', 'options'], [res, context, route, page, options || {}]);
    } else if (!!responseFormatFunction?.trim()) {
      return fn.exec(responseFormatFunction, ['response', 'context', 'route', 'page'], [res, context, route, page]);
    }
  }
  return res;
}

function prepareUrl(path: string, query: Record<string, string>) {
  const joinChar = path.indexOf('?') > -1 ? '&' : '?';
  const search = Object.keys(query || {}).map((key) => `${key}=${encodeURIComponent(query[key])}`).join('&');
  return path + (search ? joinChar + search : '');
}

async function findApi(id: string) {
  const apiItems = await config.installApiResources();
  return apiItems.find((m) => m.name == id);
}

/**
 * Execute the API call
 * @param api API config info
 * @param context API parameter value context
 * @param allIn params to attach directly
 */
export async function callApi<T>(api: ApiConfigurerModel, context: Model, route: Model, allIn?: Model, mockResponse?: any, options?: Record<string, any>): Promise<T> {
  const runtime = { isCallNetwork: false };
  try {
    const meta = await findApi(api?.meta?.name);
    const page = store.getPageState();
    if (!meta) {
      if (config.getOptions().isDesign && api?.meta?.name) {
        toast.warning(`current API(${api?.meta?.name}): no generated config,cannot call!`);
        return null;
      }
      return execResponseFunction(api || {} as ApiConfigurerModel, mockResponse || {}, context, route, page, options);
    }
    const base = await config.getEnvVariable(`API_${String(meta.system).toUpperCase()}_HOST`, '');
    const myOptions = base ? { base } : {};
    const network = new Network(myOptions);
    const { method, path, contentType, headers } = meta;
    const loading = api.loading;
    const responseType = meta.responseType || 'json';
    const data = prepareParameters(api, context || {}, route || {}, allIn, page, options) || {} as RequestFormater;
    const type = config.getOptions().isDesign ? 'design' : 'runtime';
    const url = prepareUrl(path, data.query);
    let res = {};
    if (data.cancel == true) {
      return execResponseFunction(api, res, context, route, page, options);
    } else if (api.mock) {
      runtime.isCallNetwork = true;
      res = await ResourceService.getApiResponseResource(meta.id.toString());
    } else {
      const response = network.any(url, data.body, method as any, headers).with(contentType).setExtra({
        type,
        asyncApi: api,
      });
      loading && response.showLoading('Loading...');
      api.silent && response.silent();
      api.mock && response.credentials(undefined);
      runtime.isCallNetwork = true;
      res = await response[responseType]();
    }

    const result = execResponseFunction(api, res, context, route, page, options);
    return result;
  } catch (ex) {
    if (api?.silent) {
      return null;
    }
    throw ex;
  }
}

export default {
  callApi,
};