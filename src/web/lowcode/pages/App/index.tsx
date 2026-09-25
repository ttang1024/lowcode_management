import React from 'react';
import { AbstractTable, AbstractActions } from 'lowcode-blocks';
import { Plus } from 'lucide-react';
import { Button, ConfirmTyped } from 'lowcode-kit';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel } from './model';
import Record from './actions/Record';
import type { AbstractButtons, AbstractColumns, AbstractSFields } from 'lowcode-blocks/src/interface';
import { useHistory, useRouteMatch } from 'lowcode-common';
import { AppTitle, AppNavigateLink, AppStatusView } from './components';
import { AppService } from 'lowcode-services';

function AppPageView(props: ModelProps) {
  // List search fields
  const searchFields: AbstractSFields = [
    { title: 'Name', name: 'name' },
    { title: 'Code', name: 'code' },
  ];

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    { title: 'Name', name: 'name', render: (v, row) => <AppTitle data={row} /> },
    { title: 'Code', name: 'code', render: (v, row) => <AppNavigateLink data={row} /> },
    { title: 'Member APPID', name: 'code2', render: (v, row) => AppService.convertAppId(row.code) },
    { title: 'Owner', name: 'owner' },
    { title: 'Status', name: 'status', render: (v, row) => <AppStatusView data={row} /> },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create app', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Edit', target: 'cell', action: 'update' },
    { title: 'View', target: 'cell', action: 'view' },
    {
      title: 'Publish',
      target: 'cell',
      visible: (r) => r.status != 1,
      click: props.updateAppOnline,
      confirm: 'Publish this app?',
    },
    {
      title: 'Unpublish',
      target: 'cell',
      visible: (r) => r.status == 1,
      click: props.updateAppOffline,
      confirm: 'Unpublish this app? Its pages will stop being served.',
    },
    {
      title: 'Delete',
      target: 'cell',
      // Live apps must be unpublished first.
      visible: (r) => r.status != 1,
      render: (r) => (
        <ConfirmTyped
          title={`Delete “${r.name}”?`}
          description="This permanently removes the app, all of its pages and their published files. It can’t be undone."
          confirmText={r.code}
          onConfirm={() => props.removeRecordAsync(r)}
        >
          <Button variant="danger-link" size="sm">Delete</Button>
        </ConfirmTyped>
      ),
    },
  ];

  const { record, loading, idKey, action } = props;
  const history = useHistory();
  const match = useRouteMatch();

  return (
    <AbstractActions
      route={match}
      history={history}
      action={action}
      model={record}
      primaryKey={idKey}
      className="app-module"
      onRoute={props.enterAction}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      confirmLoading={props.confirmLoading}
    >
      <AbstractActions.List>
        <AbstractTable
          sort="code"
          order="descend"
          loading={loading}
          rowKey={idKey}
          columns={columns}
          buttons={buttons}
          // filters={this.filters}
          data={props.allRecords}
          searchFields={searchFields}
          onQuery={props.queryAllAsync}
        />
      </AbstractActions.List>
      <AbstractActions.Popup width={900} title="Create app" action="add" use={Record} />
      <AbstractActions.Object title="Edit app" action="update" use={Record} />
      <AbstractActions.Object title="App details" action="view" use={Record} />
    </AbstractActions>
  );
}

export default store.connect(model)(AppPageView);