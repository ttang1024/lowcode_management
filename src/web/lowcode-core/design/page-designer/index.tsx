import { AbstractActions } from 'lowcode-blocks';
import React, { useRef, useState } from 'react';
import { toast } from 'lowcode-kit';
import 'lowcode-registry/src/ruler/registrations.design';
import { type AbstractDesignerProps, NeedUpdater } from '../abstract-designer';
import ButtonConfigurer from './actions/ButtonConfigurer';
import TableColumnConfigurer from './actions/TableColumnConfigurer';
import SearchConfigurer from './actions/SearchConfigurer';
import SearchItemConfigurer from './actions/SearchItemConfigurer';
import { processAction, processCancel, processSubmit } from './model';
import ButtonListConfigurer from './actions/ButtonListConfigurer';
import TableConfigurer from './actions/TableConfigurer';
import FormConfigurer from './actions/FormConfigurer';
import FormItemConfigurer from './actions/FormItemConfigurer';
import FormGroupConfigurer from './actions/FormGroupConfigurer';
import FormButtonListConfigurer from './actions/FormButtonListConfigurer';
import FormButtonConfigurer from './actions/FormButtonConfigurer';
import PublishConfigurer from './actions/PublishConfigurer';
import PublishLogger from './actions/PublishLogger';
import deepmerge from 'lowcode-blocks/src/abstract-form/deepmerge';
import type { DrawerActionProps } from 'lowcode-blocks/src/abstract-actions/action';
import TableColumnGenerator from './actions/TableColumnGenerator';
import FormItemGenerator from './actions/FormItemGenerator';
import { AppPageService, ResourceService } from 'lowcode-services';
import ClipboardWatcher from '../clipboard-watcher';
import type { AbstractResponseModel } from 'lowcode-blocks/src/interface';
import PageConfigurer from './actions/PageConfigurer';
import SubFormButtonListConfigurer from './actions/SubFormButtonListConfigurer';
import ActionInjecter from './components/action-injecter';
import 'lowcode-registry/src/converter/registrations.design';
import CssConfigurer from './actions/CssConfigurer';
import { openDiffer } from 'lowcode-ui/src/diff-view';
import useInitPosition from './useInitPosition';

interface ActionContext {
  // current action name
  name: string
  // whether the current action edits the full data
  fullUpdate?: boolean
  // all page config data currently in use
  config?: PageConfigurerModel
  // the data for the current action
  model?: any
  // Whether to return to the previousaction
  needBack?: string
  // template data passed in when creating
  addTemplate?: any
}

export interface PageDesignerOptions {
  // current action
  action: string
  // the view name for the current action
  actionView: ViewConfigurerModel
  // Current sub-action
  subAction: string
  // View name of the current sub-action
  subActionView: ViewConfigurerModel
  // Sub-action data
  subRecord: Record<string, any>
  // the data returned by the current action
  record: Record<string, any>
  // the data returned by the current list
  allRecords: AbstractResponseModel<any>
  // whether currently on the list
  atListView: boolean
}

export interface PageDesignerProps extends AbstractDesignerProps<PageConfigurerModel, PageDesignerOptions> {
  type: 'page'
  options: PageDesignerOptions
}

export default function PageDesigner(props: PageDesignerProps) {
  const options = props.options;
  const config = props.data;
  const memo = useRef({ updateValues: config });
  const isInitialize = config.version == 0 && !config.fromCache;
  const [loading, setLoading] = useState(false);
  const updaterRef = useRef<NeedUpdater>(undefined);
  const [action, setAction] = useState<ActionContext>({
    needBack: '',
    config: config,
    model: config,
    addTemplate: null,
    fullUpdate: isInitialize,
    name: isInitialize ? 'search' : '',
  });

  const actionViewId = options.actionView?.id;
  const subActionViewId = options.subActionView?.id;

  // Enter the given action
  const enterAction = (name: string, model?: any, needSubmit?: boolean, initConfig?: PageConfigurerModel) => {
    if (!name) {
      updaterRef.current?.clearNotice();
      return setAction({ ...action, name: '' });
    }
    const template = JSON.parse(JSON.stringify(model || {}));
    const id = name.split('-').slice(1).join('-');
    const needBack = name.indexOf('-') > 0 && id == action.name;
    const allValues = initConfig || (needSubmit ? memo.current.updateValues : config);
    const res = processAction(name, allValues, model, actionViewId, subActionViewId);
    // An action switch must reach the overlays even right after live edits.
    updaterRef.current?.clearNotice();
    setAction({ ...res, name, addTemplate: template, needBack: needBack ? action.name : '' });
    if (needSubmit) {
      props.onSubmit(memo.current.updateValues);
    }
  };

  // Initialize reference locating
  useInitPosition(config, enterAction, actionViewId, subActionViewId);

  const onValuesChange = (name: string, changedValue: Record<string, any>, previous: Record<string, any>) => {
    const values = deepmerge({ ...previous }, changedValue);
    // Sync config changes in real time for live rendering
    Object.keys(values).forEach((key) => {
      action.model[key] = values[key];
    });
    const allValues = action.fullUpdate ? { ...action.model } : { ...action.config };
    memo.current.updateValues = allValues;
    updaterRef.current.noticeUpdater();
    props.onValuesChanged(allValues);
  };

  // Submit the given operation
  const onSubmit = (data) => {
    if (action.name == 'publish') {
      return onPublish(props.data, data.model);
    }
    const merge = action.fullUpdate ? data.model : {};
    let model = { ...action.config, ...merge, fromCache: true };
    const value = processSubmit(action.name, { ...action.model, ...data.model }, model, actionViewId);
    model = (value as any) || model;
    props.onSubmit(model);
    memo.current.updateValues = model;
    if (/add-/.test(data.action)) {
      toast.success('Added — you can add another');
      // Create mode; you can keep adding
      enterAction(data.action, action.addTemplate, false, model);
    } else if (action.needBack) {
      enterAction(action.needBack, {}, false, model);
    } else {
      enterAction('', null, model);
    }
  };

  // Cancel the given operation
  const onCancel = () => {
    // all changes made during the process must be rolled back here
    const config = processCancel(action.name, action.model, action.config, actionViewId, subActionViewId);
    props.onSubmit({ ...config }, true);
    if (action.needBack) {
      enterAction(action.needBack);
    } else {
      enterAction('');
    }
  };

  // Publish the page
  const onPublish = async(config: PageConfigurerModel, logger: PagePublishModel) => {
    try {
      setLoading(true);
      const result = await AppPageService.publishAppPageOnline(config, logger, logger.backup);
      props.data.version = result.version;
      // the local cache must be removed; move it to the backup here
      await ResourceService.removePersistPageConfig(config.appCode, config.code);
      toast.success('Page published');
      enterAction('');
    } catch (ex) {
      if (ex.message == 'conflict') {
        enterAction('');
        openDiffer({
          title: 'Publish conflict',
          leftTitle: `Local (version ${config.version})`,
          rightTitle: `Server (version ${ex.data.version})`,
          oldValue: JSON.stringify(action.config, null, 2),
          newValue: JSON.stringify(ex.data, null, 2),
          onCancel: () => { },
          onSubmit: (content: string) => {
            onPublish(JSON.parse(content), logger);
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Restore to the given config
  const onRevert = (config: PageConfigurerModel) => {
    memo.current.updateValues = config;
    props.onSubmit(config);
    enterAction('');
  };

  const actionOptions: Partial<DrawerActionProps<any>> = {
    width: 400,
    className: 'designer-action-view',
    drawer: {
      mask: false,
      destroyOnClose: true,
    },
  };

  return (
    <ActionInjecter
      loading={loading}
      designOptions={options}
      config={config}
      enterAction={enterAction}
    >
      {props.children}
      <NeedUpdater ref={updaterRef}>
        <div className="lowcode-designer h-0">
          <AbstractActions
            isInitialize={isInitialize}
            className="page-designer"
            config={action.config}
            model={action.model}
            action={action.name}
            onSubmit={onSubmit}
            onCancel={onCancel}
            onRevert={onRevert}
            confirmLoading={loading}
            enterAction={enterAction}
            options={options}
            onValuesChange={onValuesChange}
            drawer={{ mask: false }}
          >
            <AbstractActions.List>
              <div className="toolbox">
                <ClipboardWatcher appCode={config?.appCode} />
              </div>
            </AbstractActions.List>

            <AbstractActions.Drawer title="Manage search fields" {...actionOptions} realtime action="search" use={SearchConfigurer} />
            <AbstractActions.Drawer title="Edit search field" {...actionOptions} realtime action="edit-search" use={SearchItemConfigurer} />
            <AbstractActions.Drawer title="Add search field" {...actionOptions} action="add-search" use={SearchItemConfigurer} />

            <AbstractActions.Drawer title="Manage forms" {...actionOptions} realtime action="form" use={FormConfigurer} />
            <AbstractActions.Drawer title="Edit group" {...actionOptions} realtime action="edit-group" use={FormGroupConfigurer} />
            <AbstractActions.Drawer title="Edit form" {...actionOptions} realtime action="edit-form" use={FormItemConfigurer} />
            <AbstractActions.Drawer title="Add form" {...actionOptions} action="add-form" use={FormItemConfigurer} />
            <AbstractActions.Popup title="Generate fields" width={600} action="init-form" use={FormItemGenerator} />
            <AbstractActions.Drawer title="Add group" {...actionOptions} action="add-group" use={FormGroupConfigurer} />

            <AbstractActions.Drawer title="Manage form buttons" {...actionOptions} realtime action="form-button" use={FormButtonListConfigurer} />
            <AbstractActions.Drawer title="Edit form button" {...actionOptions} realtime action="edit-form-button" use={FormButtonConfigurer} />
            <AbstractActions.Drawer title="Add form button" {...actionOptions} action="add-form-button" use={FormButtonConfigurer} />

            <AbstractActions.Drawer title="Manage forms" {...actionOptions} realtime action="sub-form" use={FormConfigurer} />
            <AbstractActions.Drawer title="Edit form" {...actionOptions} realtime action="edit-sub-form" use={FormItemConfigurer} />
            <AbstractActions.Drawer title="Add form" {...actionOptions} action="add-sub-form" use={FormItemConfigurer} />
            <AbstractActions.Drawer title="Add group" {...actionOptions} action="add-sub-group" use={FormGroupConfigurer} />

            <AbstractActions.Drawer title="Manage buttons" {...actionOptions} realtime action="button" use={ButtonListConfigurer} />
            <AbstractActions.Drawer title="Edit button" {...actionOptions} realtime action="edit-button" use={ButtonConfigurer} />
            <AbstractActions.Drawer title="Add button" {...actionOptions} action="add-button" use={ButtonConfigurer} />

            <AbstractActions.Drawer title="Table management" {...actionOptions} realtime action="column" use={TableConfigurer} />
            <AbstractActions.Popup title="Generate columns" width={600} action="init-column" footer={null} use={TableColumnGenerator} />
            <AbstractActions.Drawer title="Edit column" {...actionOptions} realtime action="edit-column" use={TableColumnConfigurer} />
            <AbstractActions.Drawer title="Add column" {...actionOptions} action="add-column" use={TableColumnConfigurer} />

            <AbstractActions.Drawer title="Manage view buttons" {...actionOptions} realtime action="sub-form-button" use={SubFormButtonListConfigurer} />
            <AbstractActions.Drawer title="Edit view button" {...actionOptions} realtime action="edit-sub-form-button" use={FormButtonConfigurer} />
            <AbstractActions.Drawer title="Add view button" {...actionOptions} action="add-sub-form-button" use={FormButtonConfigurer} />
            <AbstractActions.Popup title="Edit style" {...actionOptions} width={1000} action="css-configure" use={CssConfigurer} />

            <AbstractActions.Popup title="Publish page" width={600} use={PublishConfigurer} action="publish" />
            <AbstractActions.Drawer
              {...actionOptions}
              drawer={{ maskClosable: true }}
              title="Publish history"
              showActions="none"
              use={PublishLogger}
              action="history"
            />
            <AbstractActions.Popup
              title="Page config"
              action="page-config"
              use={PageConfigurer}
            />
          </AbstractActions>
        </div>
      </NeedUpdater>
    </ActionInjecter>
  );
}

