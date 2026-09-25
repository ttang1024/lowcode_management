import React from 'react';
import { AbstractTable, AbstractActions } from 'lowcode-blocks';
import { Download, Hammer, Plus, Upload } from 'lucide-react';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel } from './model';
import type { AbstractButtons, AbstractColumns, AbstractSFields } from 'lowcode-blocks/src/interface';
import { useHistory, useRouteMatch } from 'lowcode-common';
import Record from './actions/Record';
import Import from './actions/Import';
import { Alert, Button, ConfirmTyped } from 'lowcode-kit';

function OptionsPageView(props: ModelProps) {
  // List search fields
  const searchFields: AbstractSFields = [
    { name: 'name', title: 'Name', placeholder: 'Supports fuzzy search' },
    { name: 'value', title: 'Value', placeholder: 'Supports fuzzy search' },
  ];

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    { title: 'Variable name', name: 'name' },
    { title: 'Value', name: 'value' },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create variable', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Edit', target: 'cell', action: 'update' },
    { title: 'Import', icon: <Download size="1em" />, action: 'import' },
    { title: 'Export current', icon: <Upload size="1em" />, click: props.exportRecordsAsync },
    {
      title: 'Delete',
      target: 'cell',
      render: (r) => {
        return (
          <ConfirmTyped
            title="Delete variable?"
            description="Published apps will no longer resolve it after the next build."
            confirmText={r.name}
            onConfirm={() => props.removeAsync(r)}
          >
            <Button variant="danger-link" size="sm">Delete</Button>
          </ConfirmTyped>
        );
      },
    },
    {
      title: 'Build environment variables',
      icon: <Hammer size="1em" />,
      confirm: 'Are you sure you want to build the environment variables?',
      danger: true,
      click: props.buildVariablesAsync,
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
      className="options-module"
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
          extraNode={<Alert className="mb-2">Variable changes take effect after you build environment variables.</Alert>}
          // filters={this.filters}
          data={props.allRecords}
          searchFields={searchFields}
          onQuery={props.queryAllAsync as any}
        />
      </AbstractActions.List>
      <AbstractActions.Popup width={600} title="Create environment variable" action="add" use={Record} />
      <AbstractActions.Popup width={600} title="Edit environment variable" action="update" use={Record} />
      <AbstractActions.Popup title="Bulk import" action="import" width={600} use={Import} />
    </AbstractActions>
  );
}

export default store.connect(model)(OptionsPageView);
