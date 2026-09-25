import React from 'react';
import { Modal, toast } from 'lowcode-kit';
import type { RematchEffectThis, RematchModelTo } from 'lowcode-common';
import type { AbstractAction, AbstractQueryType, InitialAction } from 'lowcode-blocks/src/interface';
import type { GeneralPagedResult } from 'lowcode-api/framework';
import { isAbsoluteUrl, type useHistory } from 'lowcode-common';
import dispatcher from '../dispatcher';
import lowcodeConfigs from 'lowcode-configs';

const isProd = lowcodeConfigs.ENV === 'prod' || lowcodeConfigs.ENV === 'pre';

export type RecordModel = OmitModel<any>
type History = ReturnType<typeof useHistory>

export interface ApiActionContext {
  row: RecordModel
  isAction?: boolean
  event: EventConfigurerModel
  callback?: (ex: Error, data: any) => void
}

interface SubmitContext {
  actionConfig: ActionConfigurerModel
  action: string
  model: RecordModel
}

export interface RouteParams extends Omit<InitialAction, 'id'> {
  type: string
  app: string
  page: string
  id: string
}

interface QueryPayload {
  queryApi: ApiConfigurerModel
  params: AbstractQueryType
  route: RouteParams
}

const modelState = {
  // the corresponding app code
  appCode: '',
  // Current action; default actions are:  add ,edit ,remove
  action: '',
  // current sub-action
  subAction: '',
  // the current table query data'spayload,used when refreshing
  query: null as QueryPayload,
  // Route params
  route: {},
  // Whether it is the first query
  initQueried: false,
  // Enter actionloading
  enterLoading: false,
  // Submit actionloading
  confirmLoading: false,
  // Submit sub-actionloading
  subConfirmLoading: false,
  // Table loadingloading
  loading: false,
  subActionId: null,
  // Sub-action data
  subRecord: {},
  // the record currently being operated on
  record: {},
  // Paginated query
  allRecords: {
    count: 0, // Total records
    models: [] as any[], // all data returned by this query
  },
  id: null,
  actionConfig: null as ActionConfigurerModel,
  subActionConfig: null as ActionConfigurerModel,
  // Whether newly created
  isNewCreated: false,
};

const confirmApi = () => {
  return new Promise<boolean>((resolve) => {
    if (!isProd || !dispatcher.configer.getOptions().isDesign) {
      // if not production or not in design mode, skip the API call confirmation
      return resolve(true);
    }
    Modal.confirm({
      title: 'Call a production API?',
      content: (
        <div>
          This page is running against the <span className="font-semibold text-red-600">production environment</span>. Are you sure you want to call this API?
        </div>
      ),
      okText: 'Confirm call',
      danger: true,
      onCancel: () => resolve(false),
      onOk: () => resolve(true),
    });
  });
};

export default function createModel(name: string) {
  const model = {
    name: name,
    state: modelState,
    effects: {
      // Query table info
      async queryAllAsync(this: ModelThis, req: QueryPayload, _tree: any) {
        this.setState({ loading: true });
        const query = req;
        const { params, route, queryApi } = req;
        if (params?.pageNo) {
          params.pageIndex = params.pageNo;
          delete params.pageNo;
        }
        const asynced = dispatcher.api.callApi<GeneralPagedResult<RecordModel>>(queryApi, params, route, params);
        const response = await asynced;
        const result = response?.result || {} as typeof modelState.allRecords;
        const allRecords = {
          count: result.count || 0,
          models: Array.isArray(result.models) ? result.models : [],
        };
        this.setState({
          loading: false,
          initQueried: true,
          query: query,
          allRecords: allRecords,
          route: route,
          isNewCreated: false,
        });
      },
      // Enter operation mode
      async enterAction(this: ModelThis, data: { payload: AbstractAction, config: ActionConfigurerModel }, tree: any) {
        const { payload, config } = data;
        const state = tree[model.name] as ModelState;
        if (payload.action == 'list' || !payload.action) {
          payload.action != state.action && this.onCancel();
          return;
        }
        if (payload.id) {
          this.setState({ enterLoading: true });
          const context = { ...payload.model, id: payload.id };
          const mockResponse = { result: payload.model || {} };
          const res = await dispatcher.api.callApi<ApiResponse<RecordModel>>(config?.api, context, state.route, null, mockResponse);
          payload.model = res?.result || {};
        }
        this.setState({
          id: payload.id,
          actionConfig: config,
          record: payload.model || {},
          action: payload.action,
          enterLoading: false,
        });
      },
      // Enter sub-action
      async enterSubAction(this: ModelThis, data: { payload: AbstractAction, config: ActionConfigurerModel }, tree: any) {
        const { payload, config } = data;
        const state = tree[model.name] as ModelState;
        const context = { id: payload.id };
        const hasApi = !!config.api?.meta?.name;
        const res = await dispatcher.api.callApi<ApiResponse<RecordModel>>(config?.api, context, state.route);
        this.setState({
          subAction: payload.action,
          subActionId: context.id,
          // if not setapi inherit the viewrecord
          subRecord: hasApi ? res?.result || {} : payload.model || state.record || {},
          subActionConfig: config,
        });
      },
      // Cancel sub-action
      onSubCancel(this: ModelThis, payload?: Partial<QueryPayload>, tree?: any) {
        const state = tree[model.name] as ModelState;
        state.subActionConfig?.onCancel?.();
        this.setState({ subAction: '', subConfirmLoading: false });
      },
      // Refresh table
      refresh(this: ModelThis, payload: Partial<QueryPayload>, state) {
        this.queryAllAsync({ ...state[model.name].query, ...payload });
      },
      // Auto refresh
      autoRefresh(this: ModelThis, payload: { refreshKeepPage: boolean }, tree) {
        const state = tree[model.name] as ModelState;
        if (state.loading) {
          // if loading
          return;
        }
        if (state.action == '' || state.action == 'list') {
          if (payload.refreshKeepPage === false) {
            state.query.params.pageIndex = 1;
            state.query.params.pageNo = 1;
          }
          // only refresh in list-page state
          this.queryAllAsync({ ...state.query });
        }
      },
      onApiResponse(this: ModelThis, payload: { response: any, refresh: ReloadTypes, closeOnSubmit: boolean, message: string }) {
        this.leaveAction({
          isCallApi: true,
          reload: payload.refresh as any,
          message: payload.message,
          closeOnSubmit: payload.closeOnSubmit,
        });
      },
      // Refresh control
      async handleSubmitRefresh(this: ModelThis, payload: { reload: ReloadTypes }, tree: any) {
        const state = tree[model.name] as ModelState;
        const reloadTypes = payload.reload instanceof Array ? payload.reload : [payload.reload];
        reloadTypes.forEach((m) => {
          switch (m) {
            case 'table':
              this.refresh({});
              break;
            case 'page':
              this.enterAction({
                config: state.actionConfig,
                payload: {
                  id: state.id,
                  model: state.record,
                  action: state.action,
                },
              });
              break;
            case 'sub-page':
              this.enterSubAction({
                config: state.subActionConfig,
                payload: {
                  id: state.subActionId,
                  action: state.subAction,
                },
              });
              break;
          }
        });
      },
      // Leave action
      async leaveAction(this: ModelThis, payload: { isCallApi?: boolean, closeOnSubmit: boolean, reload?: ReloadTypes, message: string }, tree: any) {
        const state = tree[model.name] as ModelState;
        // Refresh
        this.handleSubmitRefresh({ reload: payload.reload });
        // Return
        if (payload.closeOnSubmit === false) {
          this.setState({ confirmLoading: false });
          return;
        }
        if (payload.isCallApi && state.action) {
          history.back();
        }
        this.setState({ record: {}, confirmLoading: false, action: '' });
        if (payload?.message) {
          toast.info(payload.message);
        }
      },
      // Leave sub-action
      async leaveSubAction(this: ModelThis, payload: { isCallApi?: boolean, closeOnSubmit: boolean, reload?: ReloadTypes, message: string }) {
        const { message: content } = payload || {};
        if (content) {
          toast.info(content);
        }
        if (payload.closeOnSubmit !== false) {
          this.setState({ subConfirmLoading: false, subAction: '' });
        } else {
          this.setState({ subConfirmLoading: false });
        }
        this.handleSubmitRefresh({ reload: payload.reload });
      },
      // Cancel submission
      onCancel(this: ModelThis, payload?: any, tree?: any) {
        const state = tree[model.name] as ModelState;
        state.subActionConfig?.onCancel?.();
        this.setState({ record: {}, confirmLoading: false, action: '' });
      },
      // Call the button API
      async onCallApi(this: ModelThis, { row, event, callback }: ApiActionContext, tree: any) {
        try {
          const state = tree[model.name] as ModelState;
          const api = event.api;
          if (!api) {
            toast.warning('Missing API config');
            callback?.(new Error('reject'), null);
            return;
          }
          const keep = await confirmApi();
          if (keep === false) {
            // if cancelled, abort directly
            return;
          }
          const response = await dispatcher.api.callApi<ApiResponse<any>>(api, row, state.route);
          const apiMessage = dispatcher.fn.format(event.apiMessage || 'Operation succeeded', row);
          if (event?.noApiMessage !== true) {
            toast.success(apiMessage);
          }
          const isSubAction = !!state.subAction;
          if (isSubAction) {
            this.leaveSubAction({ message: '', closeOnSubmit: event.closeOnSubmit, reload: event.reloadType, isCallApi: true });
          } else {
            this.leaveAction({ closeOnSubmit: event.closeOnSubmit, reload: event.reloadType, isCallApi: true, message: '' });
          }
          callback?.(null, response);
        } catch (ex) {
          callback?.(ex, null);
          return Promise.reject(ex);
        }
      },
      // Submit operation
      async onSubmit(this: ModelThis, data: SubmitContext, tree: any) {
        const keep = await confirmApi();
        if (keep === false) {
          return;
        }
        const state = tree[model.name] as ModelState;
        const config = data.actionConfig;
        const view = config.viewConfig;
        const message = config.noMessage ? '' : dispatcher.fn.format(config.successMessage || 'success', data);
        const isSubAction = view.type == 'sub-view';
        const name = isSubAction ? 'subConfirmLoading' : 'confirmLoading';
        try {
          this.setState({ [name]: true });
          const response = await Promise.resolve(dispatcher.api.callApi(config.submitApi, data.model, state.route, data.model));
          if (isSubAction) {
            this.leaveSubAction({ message, closeOnSubmit: config.closeOnSubmit, reload: config.reloadType });
          } else {
            this.leaveAction({ message, reload: config.reloadType, closeOnSubmit: config.closeOnSubmit });
          }
          config.onPostSubmit?.(data.model, (response as any).result);
        } catch (ex) {
          console.error(ex);
          this.setState({ [name]: false });
        }
      },
      // Navigate
      async navigate(this: ModelThis, payload: { row: any, history: History, event: EventConfigurerModel }) {
        const urlFn = dispatcher.fn.create<string>(payload?.event?.href, ['model']);
        let url = urlFn?.(payload.row);
        const history = payload?.history;
        if (isAbsoluteUrl(url)) {
          // location.href = url;
          window.open(url);
          return;
        }
        url = dispatcher.router.autoConvertUrl(url);
        if (history) {
          history.push(url);
        } else {
          // location.href = url;
          window.open(url);
        }
      },
      // during design, some behaviors hot-reload
      async hotUpdate(this: ModelThis, data: { isDesign: boolean, type: string, config: PageConfigurerModel }, tree: any) {
        const state = tree[model.name] as ModelState;
        if (!data?.config || !data.isDesign) return;
        switch (data.type) {
          case 'queryApi':
            if (state.initQueried) {
              this.refresh({ queryApi: data.config?.queryApi });
            }
            break;
          case 'destory':
            this.setState({ isNewCreated: true, initQueried: false });
            break;
        }
      },
    },
    reducers: {
      onError(state: ModelState, payload: { name: string; error: unknown }): ModelState {
        // Alleffects any execution error here triggers thisreducer
        switch (payload.name) {
          case 'queryAllAsync':
            return { ...state, loading: false };
          case 'enterAction':
            return { ...state, enterLoading: false };
          case 'onSubmit':
          default:
            return { ...state };
        }
      },
      setState(state: ModelState, payload: Partial<ModelState>): ModelState {
        return {
          ...state,
          ...payload,
        };
      },
    },
  };

  return model;
}

type ModelType = ReturnType<typeof createModel>

interface ModelThis extends RematchEffectThis<ModelType> { }

export type ModelState = typeof modelState;

export type ModelProps = RematchModelTo<ModelType>;