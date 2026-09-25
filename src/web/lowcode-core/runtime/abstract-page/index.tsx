import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { AbstractTable, AbstractActions, Exception, OverridePageHeader, type SubmitAction } from 'lowcode-blocks';
import { Spin, toast } from 'lowcode-kit';
import { store } from '../../provider';
import createModel, { type RecordModel, type ModelProps, type RouteParams } from './model';
import AbstractView from './actions/AbstractView';
import { useHistory, useRouteMatch } from 'lowcode-common';
import { ResourceService } from 'lowcode-services';
import LowcodeDesigner, { DesignerContext } from '../../design/lowcode-designer';
import useSearchFields from './hooks/useSearchFields';
import useButtons from './hooks/useButtons';
import useColumns from './hooks/useColumns';
import useActions from './hooks/useActions';
import useSearchOptions from './hooks/useSearchOptions';
import useSubActions from './hooks/useSubActions';
import type { AbstractAction } from 'lowcode-blocks/src/interface';
import dispatcher from '../dispatcher';
import AppContext from '../app-context';
import type { PageDesignerOptions } from '../../design/page-designer';
import useRefresh from './hooks/useRefresh';
import ExternalPage from '../external-page';
import usePageSync from './hooks/usePageSync';
import { ComponentContext, type ComponentContextValue } from 'lowcode-registry/src/component/SecurityWrapper';
import { usePageRoute } from 'lowcode-registry';
import { useAutomaticTitle } from './hooks/useAutomaticTitle';

// Why a page isn't served at its public URL (keyed by page status).
const UNAVAILABLE: Record<string, { title: string, desc: string }> = {
  0: { title: 'Page not published yet', desc: 'This page is still a draft. Publish it from the Pages list or the designer to make it available here.' },
  2: { title: 'Page is offline', desc: 'This page was unpublished. Publish it again to make it available here.' },
  404: { title: 'Page does not exist', desc: 'Check the address, or create and publish the page first.' },
};

function AbstractPageView(props: ModelProps) {
  const history = useHistory();
  const match = useRouteMatch<RouteParams>();
  const context = useContext(AppContext);
  const { record, loading, action, subAction } = props;
  const designerContext = useContext(DesignerContext);
  const isDesign = designerContext.enable;
  const { app, page } = usePageRoute(context, isDesign);
  const api = ResourceService.useQuery().getPageResource(app, page, isDesign, designerContext.resolveConflict);
  const response = api.data;
  const searchFields = useSearchFields(response?.searchFields, response);
  const buttonConfig = useButtons(response?.buttons, props);
  const columns = useColumns(response?.columns);
  const actions = useActions(response, props);
  const subActions = useSubActions(response, props);
  const searchOptions = useSearchOptions(response);
  const status = api?.data?.status;
  const idKey = response?.idKey;

  const currentAction = actions?.find((m) => m.name == action);
  const actionView = currentAction?.viewConfig;
  const subActionView = subActions?.find((m) => m.name == subAction)?.viewConfig;
  const atListAction = !action || action == 'list';

  const getContainer = useCallback(() => document.getElementById('PAGE_TOP_ACTIONS'), []);

  const queryApiRef = useRef(response?.queryApi);
  queryApiRef.current = response?.queryApi;
  const handleQuery = useCallback(
    (query) => props.queryAllAsync({ queryApi: queryApiRef.current, params: query, route: match.params }),
    [match.params.app, match.params.page],
  );

  // Refresh mechanism
  useRefresh(response, props.autoRefresh);

  // multi-tab sync while designing the page
  usePageSync(isDesign, api);

  useAutomaticTitle(response, currentAction);

  // Configure API call environment info
  dispatcher.configer.configOptions({ isDesign });

  // Design phase: node context
  const nodeContext = {
    onSubmit: (config) => {
      api.update(config);
      // Cache config data locally
      ResourceService.persistPageConfig(app, page, config);
    },
    onValuesChanged: (values) => {
      api.update(values);
    },
  };

  const hotUpdate = (type) => {props.hotUpdate({ isDesign, type: type, config: response });};

  const componentContext = useMemo<ComponentContextValue>(() => {
    return {
      apiResponse: props.onApiResponse,
      dispatchButtonEvent: buttonConfig.dispatchEvent,
    };
  }, [props.onApiResponse, buttonConfig.dispatchEvent]);

  useEffect(() => {
    props.setState({ record: {}, confirmLoading: false, action: '' });
  }, []);

  useEffect(() => {
    if (!isDesign) return;
    hotUpdate('queryApi');
    return () => {
      hotUpdate('destory');
    };
  }, [response?.queryApi]);
  switch (api.status) {
    case 'loading':
      return <Spin delay={400} size="large" className="fixed inset-x-0 top-[120px]" />;
    case 'error':
      return <Exception type="500" onClick={api.refresh} title="Failed to load page" btnText="Click to retry" />;
    case 'success':
      // Only published pages (status 1) are served outside the designer.
      if (!isDesign && UNAVAILABLE[status]) {
        const reason = UNAVAILABLE[status];
        return <Exception type="404" title={reason.title} desc={reason.desc} hideActions />;
      }
  }

  // Enter action
  const onEnterAction = (payload: AbstractAction<RecordModel>) => {
    const isSubAction = payload.action && payload.action == subAction;
    const items = isSubAction ? subActions : actions;
    const config = items.find((m) => m.name == payload.action);
    props.enterAction({ config, payload });
  };

  // Submit action
  const onSubmit = (payload: SubmitAction<RecordModel>) => {
    const isSubAction = payload.action == subAction;
    const items = isSubAction ? subActions : actions;
    const config = items.find((m) => m.name == payload.action);
    if (!config?.submitApi && config?.ignoreSubmitApiCheck !== true) {
      return toast.info('Missing submit config. ');
    }
    props.onSubmit({
      model: payload.model,
      action: payload.action,
      actionConfig: config,
    });
  };

  // Config options
  const options: PageDesignerOptions = {
    action: action,
    actionView: actionView,
    subAction: subAction,
    subActionView: subActionView,
    record: props.record,
    subRecord: props.subRecord,
    allRecords: props.allRecords,
    atListView: atListAction,
  };

  const pageType = response.pageType || 1;
  const headerVisible = response?.options?.hideHeader !== true;
  const title = api.data?.name;

  if (pageType != 1) {
    // if it is an external page
    return (
      <>
        <OverridePageHeader visible={headerVisible} title={title} />
        <ExternalPage data={response} />
      </>
    );
  }

  return (
    <LowcodeDesigner
      type="page"
      data={response}
      options={options}
      onValuesChanged={nodeContext.onValuesChanged}
      onSubmit={nodeContext.onSubmit}
    >
      <ComponentContext.Provider
        value={componentContext}
      >
        <OverridePageHeader visible={headerVisible} title={title} />
        <AbstractActions
          route={match}
          history={history}
          action={action}
          primaryKey={idKey}
          subAction={subAction}
          model={record}
          inject={isDesign}
          subModel={props.subRecord}
          pageConfigurer={response}
          enterLoading={props.enterLoading}
          className={`abstract-page-module ${isDesign ? 'lowcode-design' : ''}`}
          onRoute={onEnterAction}
          onSubmit={onSubmit}
          onCancel={props.onCancel}
          onSubCancel={props.onSubCancel}
          subConfirmLoading={props.subConfirmLoading}
          confirmLoading={props.confirmLoading}
          getActionsContainer={getContainer}
        >
          <AbstractActions.List>
            {!loading && props.enterLoading && (
              <div className="absolute inset-0 z-[999] flex justify-center pt-[300px]">
                <Spin delay={400} size="large" />
              </div>
            )}
            <AbstractTable
              {...(response?.tableOptions || {})}
              loading={loading}
              rowKey={idKey}
              columns={columns}
              inject={isDesign}
              paramMode="mix"
              buttons={buttonConfig.buttons}
              className={`abstract-page-table ${(response?.filter as any)?.tabs?.length > 0 ? 'has-filter' : ''}`}
              searchBoxCls="abstract-page-search-box"
              searchBoxActionCls="abstract-page-search-action-box"
              buttonBoxCls="abstract-page-button-box"
              filters={response?.filter}
              searchOptions={searchOptions}
              data={props.allRecords}
              searchFields={searchFields}
              pagination={{
                current: props.query?.params?.pageIndex,
              }}
              onQuery={handleQuery}
            />
          </AbstractActions.List>
          {
            actions?.map((item) => {
              const height = item.options?.fixedFooter ? '100%' : undefined;
              const options = { ...item.options, viewConfig: item.viewConfig, action: item.name, key: `view-${item.name}` };
              switch (item.type) {
                case 'object':
                  return <AbstractActions.Object {...options} height={height} use={AbstractView} />;
                case 'popup':
                  return <AbstractActions.Popup {...options} use={AbstractView} />;
                case 'drawer':
                  return <AbstractActions.Drawer {...options} use={AbstractView} />;
              }
            })
          }
          {
            subActions?.map((item) => {
              const height = item.options?.fixedFooter ? '100%' : undefined;
              const options = { ...item.options, isSubView: true, hasSubApi: !!item.api, viewConfig: item.viewConfig, subAction: item.name, key: `subview-${item.name}` };
              switch (item.type) {
                case 'object':
                  return <AbstractActions.Object {...options} height={height} use={AbstractView} />;
                case 'popup':
                  return <AbstractActions.Popup {...options} use={AbstractView} />;
                case 'drawer':
                  return <AbstractActions.Drawer {...options} use={AbstractView} />;
              }
            })
          }
        </AbstractActions>
      </ComponentContext.Provider>
    </LowcodeDesigner>
  );
}

type ConnectType = typeof store.connect;

const cache: Record<string, ReturnType<ConnectType>> = {};

export default function AbstractPageWrapper() {
  const match = useRouteMatch<any>();
  const id = store.getPageModelId(match.params.app, match.params.page);
  const View = useMemo(() => {
    const key = id;
    if (!cache[key]) {
      cache[key] = store.connect(createModel(key));
    }
    store.setPageModuleId(key);
    return cache[key](AbstractPageView);
  }, [id]);

  return (
    <View />
  );
}