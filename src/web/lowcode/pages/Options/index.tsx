import React from 'react';
import { AbstractTable, AbstractActions } from 'lowcode-blocks';
import { Download, Plus, RefreshCw, Upload } from 'lucide-react';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel } from './model';
import type { AbstractButtons, AbstractColumns, AbstractSFields } from 'lowcode-blocks/src/interface';
import { useHistory, useRouteMatch } from 'lowcode-common';
import Record from './actions/Record';
import Import from './actions/Import';
import CrossEnvAsync from './actions/CrossEnvironmentAsync';

function OptionsPageView(props: ModelProps) {
  // List search fields
  const searchFields: AbstractSFields = [
    { title: 'Dictionary key name', name: 'name' },
    { title: 'Dictionary code', name: 'code' },
  ];

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    { title: 'Name', name: 'name' },
    { title: 'Code', name: 'code' },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create dictionary item', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Edit', target: 'cell', action: 'update' },
    { title: 'View', target: 'cell', action: 'view' },
    { title: 'Import', icon: <Download size="1em" />, action: 'import' },
    { title: 'Export current', icon: <Upload size="1em" />, click: props.exportRecordsAsync },
    { title: 'Sync', icon: <RefreshCw size="1em" />, action: 'sync' },
    // { title: 'Delete', target: 'cell', click: props.removeRecordAsync, confirm: 'Are you sure you want to delete this item?' },
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
      className="options-module testv2"
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
          onQuery={props.queryAllAsync as any}
        />
      </AbstractActions.List>
      <AbstractActions.Object title="Create dictionary item" action="add" use={Record} />
      <AbstractActions.Object title="Edit dictionary item" action="update" use={Record} />
      <AbstractActions.Object title="Dictionary details" action="view" use={Record} />
      <AbstractActions.Popup title="Bulk import" action="import" width={600} use={Import} />
      <AbstractActions.Object title="Cross-environment sync" action="sync" showActions="cancel" use={CrossEnvAsync} />
    </AbstractActions>
  );
}

export default store.connect(model)(OptionsPageView);
