import React from 'react';
import { formatDateTime } from '../shared/format';
import { AbstractTable, AbstractActions, OptionsPicker } from 'lowcode-blocks';
import { Download, Hammer, Plus, RefreshCw, Upload } from 'lucide-react';
import { Button, Confirm } from 'lowcode-kit';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel } from './model';
import type {
  AbstractButtons,
  AbstractColumns,
  AbstractSFields,
} from 'lowcode-blocks/src/interface';
import config from 'lowcode-configs';
import { useHistory, useRouteMatch } from 'lowcode-common';
import Record from './actions/Record';
import Import from './actions/Import';
import AddApiSystem from './actions/AddApiSystem';
import MockRecord from './actions/Mock';
import CrossEnvironmentAsync from './actions/CrossEnvironmentAsync';

function ApisPageView(props: ModelProps) {
  // List search fields
  const searchFields: AbstractSFields = [
    { title: 'Number', name: 'id' },
    {
      title: 'System',
      name: 'system',
      render: <OptionsPicker allOption optionsKey={config.API_SYSTEM_KEY} />,
    },
    { title: 'API description', name: 'name', break: true },
    {
      title: 'URL',
      name: 'path',
    },
  ];

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    { title: 'Number', name: 'id', width: 80 },
    { title: 'API name', name: 'name', width: 240 },
    { title: 'System', name: 'system', width: 150 },
    { title: 'URL', name: 'path' },
    { title: 'Modified', name: 'updatedAt', render: formatDateTime },
    { title: 'Created', name: 'createdAt', render: formatDateTime },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create API', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Import', icon: <Download size="1em" />, action: 'import' },
    { title: 'Export current', icon: <Upload size="1em" />, click: props.exportRecordsAsync },
    { title: 'Edit', target: 'cell', action: 'update' },
    { title: 'View', target: 'cell', action: 'view' },
    { title: 'Mock', target: 'cell', action: 'mock' },
    {
      title: 'Release',
      confirm: 'Are you sure you want to build the API resources?',
      target: 'cell',
      click: props.buildApiResource,
    },
    {
      title: 'Build API resources',
      icon: <Hammer size="1em" />,
      confirm: 'Are you sure you want to build the API resources?',
      click: props.buildApiResources,
    },
    {
      title: 'Sync',
      action: 'sync',
      icon: <RefreshCw size="1em" />,
    },
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
      subAction={props.subAction}
      model={record}
      primaryKey={idKey}
      className="apis-module"
      apiPickerKey={props.apiPickerKey}
      onRoute={props.enterAction}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      onSubCancel={props.onSubCancel}
      enterSubAction={props.enterSubAction}
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
          operation={{ width: 180 }}
          data={props.allRecords}
          searchFields={searchFields}
          onQuery={props.queryAllAsync as any}
        />
      </AbstractActions.List>
      <AbstractActions.Object title="Create API" action="add" use={Record} />
      <AbstractActions.Object
        title="Edit API"
        footActions={[
          (api: RecordModel, context) => (
            <Confirm
              title="Save and publish this API?"
              description="Apps calling it pick up the change immediately — check the impact first."
              confirmText="Publish"
              danger
              onConfirm={context.bindValidate(() => props.updateAndBuildApi(api))}
            >
              <Button variant="danger">Save and publish</Button>
            </Confirm>
          ),
        ]}
        action="update"
        use={Record}
      />
      <AbstractActions.Object title="API details" action="view" use={Record} />
      <AbstractActions.Popup width={600} title="Add API system" subAction="add-sys" use={AddApiSystem} />
      <AbstractActions.Popup title="Bulk import" action="import" width={600} use={Import} />
      <AbstractActions.Object title="Mock data" action="mock" use={MockRecord} />
      <AbstractActions.Object title="Cross-environment sync" action="sync" showActions="cancel" use={CrossEnvironmentAsync} />
    </AbstractActions>
  );
}

export default store.connect(model)(ApisPageView);
