
import React, { useCallback, useMemo } from 'react';
import { component } from 'lowcode-registry';
import { AbstractIcon, AbstractTableInput } from 'lowcode-blocks';
import type { AbstractTableInputProps } from 'lowcode-blocks/src/abstract-table-input';
import type { AbstractEColumns } from 'lowcode-blocks/src/interface';
import type { AbstractEditColumnType, AbstractTableProps } from 'lowcode-blocks/src/abstract-table/types';
import { Button, fromButtonConfig } from 'lowcode-kit';
import { dispatcher } from 'lowcode-core';
import { useRouteMatch } from 'lowcode-common';
import { useDispatchEventAction } from '../../hook';

export interface AbstractTableInputColumn extends AbstractEditColumnType<any> {
  control: ComponentModel
}

export interface TableInputRuntimeProps extends Omit<AbstractTableInputProps<any>, 'removeVisible' | 'addVisible'> {
  model: any
  columns: AbstractTableInputColumn[]
  operation: AbstractTableProps<any>['operation']
  saveApi?: ApiConfigurerModel
  removeApi?: ApiConfigurerModel
  removeVisible?: boolean
  addVisible?: boolean
  showOperation?: boolean
  addBtn: {
    text: string
    icon: string
    shape: ButtonConfigModel['shape']
    size: ButtonConfigModel['size']
    type: ButtonConfigModel['type']
    event: EventConfigurerModel
    visible: boolean
  }
}

export function TableInputRuntime({
  showOperation,
  addVisible,
  removeVisible,
  addBtn,
  removeApi,
  saveApi,
  ...props
}: TableInputRuntimeProps) {
  const value = useMemo(() => {
    if (!(props.value instanceof Array)) return [];
    return props.value;
  }, [props.value]);

  const match = useRouteMatch();
  const eventer = useDispatchEventAction(addBtn?.event);
  const isDefaultOperation = () => {
    const type = addBtn?.event?.type;
    return !type || type == 'none';
  };

  const columns = useMemo<AbstractEColumns<any>>(() => {
    const items = props.columns || [];
    return items.map((item) => {
      const editor = (record) => {
        return component.create(item.control, record, {}, record);
      };
      const registration = component.getRegistration(item.control?.name);
      return {
        name: item.name,
        title: item.title,
        width: item.width,
        editor: registration?.type == 'input' ? editor : undefined,
        render: registration?.type == 'display' ? (v, row) => editor(row) : undefined,
      };
    });
  }, [props.columns]);

  // Create row
  const onCreate = useCallback((emptyRow) => {
    const model = emptyRow || {} as Record<string, any>;
    // If using the default create, return directly
    if (isDefaultOperation()) {
      return model;
    };
    return new Promise((resolve) => {
      eventer.dispatch(model, (value, isCancel) => {
        if (isCancel) return;
        resolve(value);
      });
    });
  }, []);


  // Save row
  const onSave = useMemo(() => {
    if (props.mode != 'row' || !saveApi) return undefined;
    return (row: any) => {
      return dispatcher.api.callApi<any>(saveApi, row, match.params);
    };
  }, [props.mode, saveApi]);

  // Remove row
  const onRemove = useMemo(() => {
    if (props.mode != 'row' || !removeApi) return undefined;
    return (row: any) => {
      return dispatcher.api.callApi<any>(removeApi, row, match.params);
    };
  }, [props.mode, removeApi]);

  const onEdit = useCallback((row, defaultEdit) => {
    if (isDefaultOperation()) {
      return defaultEdit(row);
    }
    return onCreate(row);
  }, [addBtn?.event]);

  const addButton = useMemo(() => {
    return (
      <Button
        {...fromButtonConfig(addBtn || {})}
        icon={addBtn?.icon ? <AbstractIcon type={addBtn.icon} /> : undefined}
      >
        {addBtn?.text || 'Add a row'}
      </Button>
    );
  }, [addBtn]);

  const mode = useMemo(() => {
    switch (props.mode) {
      case 'row':
        return isDefaultOperation() ? 'row' : 'row-api';
      default:
        return props.mode;
    }
  }, [props.mode, addBtn?.event?.type]);

  const isAddVisible = useMemo(() => {
    return () => {
      return addVisible;
    };
  }, [addVisible]);

  const isRemoveVisible = useMemo(() => {
    return () => {
      return removeVisible;
    };
  }, [removeVisible]);

  return (
    <AbstractTableInput
      {...props}
      addButton={addButton}
      value={value}
      onSave={onSave}
      onRemove={onRemove}
      onCreate={onCreate}
      onEdit={onEdit}
      mode={mode}
      hideOperation={showOperation === false}
      removeVisible={isRemoveVisible}
      addVisible={isAddVisible}
      cancelConfirm={props.cancelConfirm}
      removeConfirm={props.removeConfirm}
      columns={columns}
    />
  );
}


export default component.runtime('table-input', { type: 'input', valueType: 'object[]' })(TableInputRuntime);
