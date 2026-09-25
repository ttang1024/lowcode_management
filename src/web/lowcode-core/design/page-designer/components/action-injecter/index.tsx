import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AbstractInjecter } from 'lowcode-blocks';
import type { AbstractInjecterContextValue } from 'lowcode-blocks/src/abstract-injecter';
import { ParentHover } from './ParentHover';
import { ActionButton, ActionButtonContext } from './ActionButton';
import ReactDOM from 'react-dom';
import { CirclePlus, Copy, Eraser, Funnel, History, LayoutGrid, LayoutPanelTop, Rocket, Settings, Table, Wrench } from 'lucide-react';
import ClipboardWatcher from '../../../clipboard-watcher';
import type { PageDesignerOptions } from '../..';
import { Confirm } from 'lowcode-kit';
import { ResourceService } from 'lowcode-services';
import { LayoutDesignerContext } from '../../../layout-designer';

// Where the designer bar tools render: the studio shell's bar when present,
// else the slot the app layout reserves above the page.
function useToolbarTarget() {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    setTarget(document.getElementById('lc-designer-tools') || document.querySelector('.injecter-top-actions'));
  }, []);
  return target;
}

export interface ActionInjecterProps {
  config: PageConfigurerModel
  loading?: boolean
  designOptions: PageDesignerOptions
  enterAction: (name: string, model?: any, needSubmit?: boolean, initConfig?: PageConfigurerModel) => void
}

interface DataRefState {
  options: PageDesignerOptions
  enterAction: ActionInjecterProps['enterAction']
}

export default function ActionInjecter(props: React.PropsWithChildren<ActionInjecterProps>) {
  const configRef = useRef<PageConfigurerModel>(props.config);
  const dataRef = useRef<DataRefState>({ options: {} as PageDesignerOptions, enterAction: null });
  configRef.current = props.config;
  dataRef.current.options = props.designOptions;
  dataRef.current.enterAction = props.enterAction;

  const findView = () => {
    const designOptions = dataRef.current.options;
    const isSubAction = !!designOptions.subActionView;
    return {
      isSubAction,
      view: isSubAction ? designOptions.subActionView : designOptions.actionView,
    };
  };

  const injecter = useMemo<AbstractInjecterContextValue>(() => {
    return {
      listener: {
        // Double-click to edit table column
        onColumnDbClick: (column) => {
          const columns = configRef.current.columns || [];
          const item = columns.find((m) => m.name == column.name);
          if (item) {
            dataRef.current.enterAction('edit-column', columns.indexOf(item));
          } else if (column.name == 'cell-operator') {
            dataRef.current.enterAction('column', null);
          }
        },
        onFieldDbClick(field, type) {
          const meta = findView();
          const view = meta.view;
          const editAction = meta.isSubAction ? 'edit-sub-form' : 'edit-form';
          switch (type) {
            case 'AbstractSearch':
              // Double-click to edit search field
              const fields = configRef.current.searchFields || [];
              const item = fields.find((m) => m.name == field.name);
              if (item) {
                dataRef.current.enterAction('edit-search', fields.indexOf(item));
              }
              break;
            default:
              // Edit form
              const fieldItem = view.groups.find((m) => m.name == field.name);
              dataRef.current.enterAction(editAction, view.groups.indexOf(fieldItem));
              break;
          }
        },
        onFieldGroupDbClick(group, type) {
          const meta = findView();
          const view = meta.view;
          const editAction = meta.isSubAction ? 'edit-sub-group' : 'edit-group';
          switch (type) {
            case 'AbstractSearch':
              break;
            default:
              // Edit form
              const groupItem = view.groups.find((m) => m.group == group.group);
              dataRef.current.enterAction(editAction, view.groups.indexOf(groupItem));
              break;
          }
        },
      },
      node: {
        // Edit search criteria
        appendSearchAfter() {
          return (
            <ParentHover>
              <ActionButton icon={<CirclePlus size="1em" />} action="add-search" tooltip="Add search item" />
              <ActionButton icon={<Settings size="1em" />} action="search" tooltip="Manage search" />
            </ParentHover>
          );
        },
        // Table
        appendAbstractTableInner() {
          return (
            <ParentHover className="injecter-table-toolbox absolute top-3 left-1/2 -translate-x-1/2">
              <ActionButton icon={<Rocket size="1em" />} action="init-column" tooltip="Initialize columns" />
              <ActionButton icon={<CirclePlus size="1em" />} action="add-column" tooltip="Add column" />
              <ActionButton icon={<Settings size="1em" />} action="column" tooltip="Column management" />
            </ParentHover>
          );
        },
        // View form
        appendAbstractObjectBody() {
          const meta = findView();
          const mfix = meta.isSubAction ? 'sub-' : '';
          const view = meta.view;
          return (
            <ParentHover className="injecter-form-toolbox absolute top-1/2 right-2 -translate-y-1/2 flex-col">
              <ActionButton icon={<CirclePlus size="1em" />} placement="left" action={`add-${mfix}form`} tooltip="Add field" />
              {
                meta.isSubAction ? null : (
                  <ActionButton icon={<Rocket size="1em" />} placement="left" action={'init-form'} tooltip="Initialize fields" />
                )
              }
              <ActionButton icon={<LayoutGrid size="1em" />} placement="left" action={`add-${mfix}group`} tooltip="Add group" />
              <ActionButton icon={<Settings size="1em" />} placement="left" action={`${mfix}form`} tooltip="Manage fields" />
              <ClipboardWatcher.Copy type="form" data={view} >
                <ActionButton placement="left" icon={<Copy size="1em" />} action="" tooltip="Copy form" />
              </ClipboardWatcher.Copy>
            </ParentHover>
          );
        },
        // View action buttons
        appendAbstractObjectFooter() {
          const meta = findView();
          const mfix = meta.isSubAction ? 'sub-' : '';
          const findParent = (e: HTMLElement) => e.parentElement.parentElement.parentElement;
          return (
            <ParentHover className="object-footer-tools border-dashed shadow-none" mode="custom" findParent={findParent}>
              <ActionButton icon={<CirclePlus size="1em" />} action={`add-${mfix}form-button`} tooltip="Add button" />
              <ActionButton icon={<Settings size="1em" />} action={`${mfix}form-button`} tooltip="Manage buttons" />
            </ParentHover>
          );
        },
        // Add group field
        appendFormGroup(group) {
          const item = group.group ? { group: group.group } : {};
          const meta = findView();
          const mfix = meta.isSubAction ? 'sub-' : '';
          return (
            <ParentHover className="injecter-form-group-toolbox mx-auto mt-1 flex w-fit justify-center">
              <ActionButton
                icon={<CirclePlus size="1em" />}
                action=""
                onClick={() => dataRef.current.enterAction?.(`add-${mfix}form`, item)}
                tooltip="Add field"
              />
            </ParentHover>
          );
        },
      },
    };
  }, []);

  const context = useMemo(() => {
    return {
      onClick: (action: string) => {
        dataRef.current.enterAction?.(action);
      },
    };
  }, []);

  const onClear = useCallback(async() => {
    const config = props.config;
    await ResourceService.removePersistPageConfig(config.appCode, config.code);
    location.reload();
  }, []);

  const showRemove = false;
  const layoutDesigner = useContext(LayoutDesignerContext);
  const toolbarTarget = useToolbarTarget();

  const node = (
    <div className="injecter-design-top-toolbox flex items-center gap-2.5">
      <div className="flex items-center gap-0.5 rounded-[10px] bg-slate-100 p-[3px]" role="group" aria-label="Page structure">
        <ActionButton label icon={<Funnel size="1em" />} action="search" tooltip="Search" />
        <ActionButton label icon={<Table size="1em" />} action="column" tooltip="Columns" />
        <ActionButton label icon={<LayoutGrid size="1em" />} action="button" tooltip="Buttons" />
      </div>
      <div className="flex items-center gap-0.5 rounded-[10px] bg-slate-100 p-[3px]" role="group" aria-label="Page">
        <ActionButton icon={<Wrench size="1em" />} action="page-config" tooltip="Page config" />
        {layoutDesigner.openSettings && (
          <ActionButton icon={<LayoutPanelTop size="1em" />} action="" onClick={layoutDesigner.openSettings} tooltip="App settings" />
        )}
        <ActionButton icon={<History size="1em" />} action="history" tooltip="Publish history" />
        <ClipboardWatcher.CopyPage data={configRef?.current}>
          <ActionButton icon={<Copy size="1em" />} action="" tooltip="Copy page" />
        </ClipboardWatcher.CopyPage>
      </div>
      {
        showRemove && (
          <Confirm
            title="Discard your local changes?"
            danger
            onConfirm={onClear}
          >
            <ActionButton
              action=""
              onClick={() => { }}
              icon={<Eraser size="1em" />}
              tooltip="Discard changes"
            />
          </Confirm>
        )
      }
      <ActionButton
        label
        type="primary"
        className="h-[38px] px-[18px]"
        loading={props.loading}
        icon={<Rocket size="1em" />}
        action="publish"
        tooltip="Publish"
      />
    </div>
  ) as React.ReactNode;

  return (
    <ActionButtonContext.Provider
      value={context}
    >
      <AbstractInjecter value={injecter}>
        {props.children}
        {toolbarTarget && ReactDOM.createPortal(node, toolbarTarget)}
      </AbstractInjecter>
    </ActionButtonContext.Provider>
  );
}