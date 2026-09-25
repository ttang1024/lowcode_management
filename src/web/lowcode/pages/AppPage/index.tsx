import React, { useCallback } from 'react';
import { AbstractTable, AbstractActions, OverridePageHeader } from 'lowcode-blocks';
import { Plus, RefreshCw } from 'lucide-react';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel, type RouteParams } from './model';
import Record, { pageTypes } from './actions/Record';
import type { AbstractButtons, AbstractColumns, AbstractSFields, SubmitAction } from 'lowcode-blocks/src/interface';
import { useHistory, useRouteMatch } from 'lowcode-common';
import { AppService } from 'lowcode-services';
import { PageNavigationLink, PagePathView, PageStatusView } from './components';
import ClipboardWatcher from 'lowcode-core/design/clipboard-watcher';
import AppContext from 'lowcode-core/runtime/app-context';
import Debug from './actions/Debug';
import CrossEnvAsync from './actions/CrossEnvironmentAsync';

function AppPagePageView(props: ModelProps) {
  const { record, loading, idKey, action } = props;
  const history = useHistory();
  const match = useRouteMatch<RouteParams>();
  const response = AppService.useQuery([match.params.app]).findAppByCode(match.params.app);

  const handleQuery = useCallback(
    (query) => props.queryAllAsync({ params: query, route: match.params }),
    [match.params.app],
  );

  const filters: any = {
    name: 'pageType',
    tabs: [
      { label: 'All', value: '' },
      { label: 'Visual', value: '1' },
      { label: 'iFrame', value: '2' },
    ],
  };

  // List search fields
  const searchFields: AbstractSFields = [
    { title: 'Page name', name: 'name' },
    { title: 'Page code', name: 'code' },
  ];

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    { title: 'Page name', name: 'name' },
    { title: 'Page code', name: 'code', render: (v, row) => <PageNavigationLink data={row} app={response.data?.result} /> },
    { title: 'Page type', name: 'pageType', enums: pageTypes },
    { title: 'Path', name: 'path', render: (v, row) => <PagePathView data={row} /> },
    { title: 'Page status', name: 'status', render: (v, row) => <PageStatusView data={row} /> },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create page', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Edit', target: 'cell', action: 'update' },
    {
      title: 'Debug',
      target: 'cell',
      visible: (r) => (r.pageType || 1) == 1,
      // Opens the "choose a component bundle" dialog via its route.
      action: 'debug',
    },
    { title: 'Design', target: 'cell', action: 'design', click: (row) => history.push(`/design/${row.appCode}/${row.code}/list`) },
    {
      title: 'Publish',
      target: 'cell',
      visible: (r) => r.status != 1,
      click: props.updateAppPageOnline,
      confirm: 'Publish this page?',
    },
    {
      title: 'Unpublish',
      target: 'cell',
      visible: (r) => r.status == 1,
      click: props.updateAppPageOffline,
      confirm: 'Unpublish this page? It will stop being served.',
    },
    {
      title: 'Delete',
      target: 'cell',
      visible: (r) => r.status == 0,
      click: props.removeRecordAsync,
      confirm: 'Are you sure you want to delete this page?',
    },
    {
      title: 'Sync',
      icon: <RefreshCw size="1em" />,
      action: 'sync',
    },
  ];

  const onSubmit = (data: SubmitAction<any>) => {
    if (data.action == 'debug') {
      const record = props.record;
      const pkg = data.model.pkg;
      history.push(`/design/${record.appCode}/${record.code}/list?devtool=${pkg}`);
      return '';
    }
    return props.onSubmit(data);
  };

  return (
    <AbstractActions
      route={match}
      history={history}
      action={action}
      model={record}
      primaryKey={idKey}
      app={response.data?.result}
      className="apppage-module"
      onRoute={props.enterAction}
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      confirmLoading={props.confirmLoading}
    >
      <AppContext.Provider
        value={{
          menus: [],
          menuTheme: 'dark',
          children: null,
          config: {
            code: match.params.app,
          } as any,
        }}
      >
        <ClipboardWatcher appCode={match.params.app} />
      </AppContext.Provider>
      <OverridePageHeader title={response.data?.result?.name || ' '} />
      <AbstractActions.List>
        <AbstractTable
          sort="code"
          order="descend"
          loading={loading}
          rowKey={idKey}
          columns={columns}
          buttons={buttons}
          operation={{ width: 200 }}
          filters={filters}
          data={props.allRecords}
          searchFields={searchFields}
          onQuery={handleQuery}
        />
      </AbstractActions.List>
      <AbstractActions.Popup width={700} title="Create page" action="add" use={Record} />
      <AbstractActions.Popup width={700} title="Edit page" action="update" use={Record} />
      <AbstractActions.Popup width={600} title="Choose a component bundle to debug" action="debug" use={Debug} />
      <AbstractActions.Object title="Sync page" action="sync" showActions="cancel" use={CrossEnvAsync} />
    </AbstractActions>
  );
}

export default store.connect(model)(AppPagePageView);