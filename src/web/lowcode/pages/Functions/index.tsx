import useDictionary from '../shared/useDictionary';
import React from 'react';
import {
  AbstractTable,
  AbstractActions,
  CodeHighlight,
  OptionsPicker,
} from 'lowcode-blocks';
import { Plus } from 'lucide-react';
import { store } from 'lowcode-core/provider';
import model, { type ModelProps, type RecordModel } from './model';
import Record from './actions/Record';
import type {
  AbstractButtons,
  AbstractColumns,
  AbstractSFields,
} from 'lowcode-blocks/src/interface';
import { useHistory, useRouteMatch } from 'lowcode-common';

function Functions(props: ModelProps) {
  // List search fields
  const searchFields: AbstractSFields = [
    {
      title: 'Type',
      name: 'type',
      render: <OptionsPicker optionsKey="function_type" allowClear />,
    },
    { title: 'Purpose', name: 'usage' },
    // { title: 'Code snippet', name: 'snippet' }, // Not fuzzy search; of little use
  ];

  const functionTypes = useDictionary('function_type');

  // List fields
  const columns: AbstractColumns<RecordModel> = [
    {
      title: 'Type',
      name: 'type',
      width: 160,
      enums: functionTypes,
    },
    { title: 'Purpose', name: 'usage', width: 260 },
    {
      title: 'Code snippet',
      name: 'snippet',
      render: (value) => <CodeHighlight language="javascript" code={value} />,
    },
  ];

  // Action buttons
  const buttons: AbstractButtons<RecordModel> = [
    { title: 'Create function', icon: <Plus size="1em" />, action: 'add' },
    { title: 'Edit', target: 'cell', action: 'update' },
    { title: 'View', target: 'cell', action: 'view' },
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
      className="functions-module"
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
      <AbstractActions.Object title="Create function" action="add" use={Record} />
      <AbstractActions.Object title="Edit function" action="update" use={Record} />
      <AbstractActions.Object title="Function details" action="view" use={Record} />
    </AbstractActions>
  );
}

export default store.connect(model)(Functions);
