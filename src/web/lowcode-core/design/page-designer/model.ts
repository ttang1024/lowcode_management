import type { FormItemGeneratorModel } from './actions/FormItemGenerator';
import type { ColumnModel } from './actions/TableColumnGenerator';

export interface ActionState {
  fullUpdate?: boolean
  config: PageConfigurerModel
  model: any
}

export function processAction(name: string, config: PageConfigurerModel, payload?: any, action?: string, subAction?: string): ActionState {
  const model = payload == undefined ? {} : payload;
  const newConfig = { ...config };
  const formView = config?.views?.find((m) => m.id == action);
  const subFormView = config?.views?.find((m) => m.id == subAction);
  switch (name) {
    case 'button':
    case 'search':
    case 'column':
    case 'api':
      return {
        fullUpdate: true,
        config: newConfig,
        model: newConfig,
      };
    case 'page-config':
      return {
        model: {
          config: config,
        },
        config: newConfig,
      };
    case 'add-search':
      model.name = '';
      return {
        model,
        config: {
          ...config,
          searchFields: [
            ...(config.searchFields || []),
            model,
          ],
        },
      };
    case 'edit-search':
      return {
        model: newConfig.searchFields[model],
        config: newConfig,
      };
    case 'sub-form':
      return {
        model: subFormView,
        config: config,
      };
    case 'add-sub-group':
      model.group = 'Group name';
      subFormView.groups.push(model);
      return {
        model,
        config: config,
      };
    case 'edit-sub-group':
      return {
        model: subFormView.groups[model],
        config: newConfig,
      };
    case 'edit-sub-form':
      return {
        model: subFormView.groups[model],
        config: newConfig,
      };
    case 'form':
      return {
        model: formView,
        config: config,
      };
    case 'add-group':
      model.group = 'Group name';
      formView.groups.push(model);
      return {
        model,
        config: config,
      };
    case 'edit-group':
      return {
        model: formView.groups[model],
        config: newConfig,
      };
    case 'add-form':
    case 'add-sub-form':
    {
      const view = name == 'add-sub-form' ? subFormView : formView;
      model.title = '';
      model.name = '';
      const groups = view.groups;
      let index = -1;
      let groupIndex = -1;
      if (model.group) {
        for (let i = 0, k = groups.length; i < k; i++) {
          const group = groups[i];
          if (model.group == group.group) {
            groupIndex = i;
            continue;
          }
          if (groupIndex > -1 && group.group) {
            index = i;
            break;
          }
        }
      }
      if (index == -1 && groupIndex > -1) {
        index = groups.length;
      }
      if (index > -1) {
        delete model.group;
        view.groups = [
          ...(groups.slice(0, index)),
          model,
          ...(groups.slice(index)),
        ];
      } else {
        view.groups.push(model);
      }
      return {
        model,
        config: config,
      };
    }
    case 'edit-form':
      return {
        model: formView.groups[model],
        config: newConfig,
      };
    case 'form-button':
      return {
        model: formView,
        config: newConfig,
      };
    case 'add-form-button':
      model.size = 'large';
      formView.buttons?.push(model);
      return {
        model,
        config: config,
      };
    case 'sub-form-button':
      return {
        model: subFormView,
        config: newConfig,
      };
    case 'add-sub-form-button':
      model.size = 'large';
      subFormView.buttons?.push(model);
      return {
        model,
        config: config,
      };
    case 'edit-form-button':
      return {
        model: formView.buttons?.[model],
        config: config,
      };
    case 'edit-sub-form-button':
      return {
        model: subFormView.buttons?.[model],
        config: config,
      };
    case 'add-button':
      return {
        model,
        config: {
          ...config,
          buttons: [
            ...(config.buttons || []),
            model,
          ],
        },
      };
    case 'edit-button':
      return {
        model: newConfig.buttons[model],
        config: newConfig,
      };
    case 'add-column':
      return {
        model,
        config: {
          ...config,
          columns: [
            ...(config.columns || []),
            model,
          ],
        },
      };
    case 'edit-column':
      return {
        model: newConfig.columns[model],
        config: newConfig,
      };
    default:
      return {
        model,
        config: newConfig,
      };
  }
}


export function processSubmit(name: string, model: any, config: PageConfigurerModel, action?: string) {
  const formView = config?.views?.find((m) => m.id == action);
  switch (name) {
    case 'add-button':
    case 'edit-button':
      {
        const item = model as TableButtonModel;
        const action = item.event?.action;
        const view = config.views?.find((v) => v.id == action?.view);
        if (item.event?.type == 'action' && !view) {
          // If there is no view, create the corresponding view
          if (!view) {
            config.views = [
              ...(config.views || []),
              {
                id: action.view,
                groups: [],
                buttons: [],
              },
            ];
          }
        }
      }
      break;
    case 'add-form-button':
    case 'edit-form-button':
      {
        const item = model as TableButtonModel;
        const action = item.event?.action;
        if (item.event?.type == 'action') {
          action.view = action.view || `${action.name}_view`;
          const view = config.views?.find((v) => v.id == action.view && action.view);
          // If there is no view, create the corresponding view
          if (!view) {
            config.views = [
              ...(config.views || []),
              {
                id: action.view,
                type: 'sub-view',
                groups: [],
                buttons: [],
              },
            ];
          }
        }
      }
      break;
    case 'add-sub-form-button':
    case 'edit-sub-form-button':
      {
        const item = model as TableButtonModel;
        const action = item.event?.action;
        if (item.event?.type == 'action') {
          action.view = action.view || action.name + '_view';
          const view = config.views?.find((v) => v.id == action.view);
          // If there is no view, create the corresponding view
          if (!view) {
            config.views = [
              ...(config.views || []),
              {
                id: action.view,
                type: 'sub-view',
                groups: [],
                buttons: [],
              },
            ];
          }
        }
      }
      break;
    case 'init-column':
      {
        const data = Object.values(model) as ColumnModel[];
        const columns = config.columns = config.columns || [];
        data?.forEach((item) => {
          const { name, title } = item;
          if (!columns.find((m) => m.name == name)) {
            columns.push({ title, name });
          }
        });
      }
      break;
    case 'init-form':
      {
        const data = model as FormItemGeneratorModel;
        const groups = formView.groups = formView.groups || [];
        data
          ?.items
          ?.filter((item) => !!item.title?.trim())
          .forEach((item) => {
            const { name, title } = item;
            if (!groups.find((m) => m.name == name)) {
              groups.push({ title, name });
            }
          });
      }
      break;
    case 'page-config':
      return model.config;
  }
}

export function processCancel(name: string, model: any, config: PageConfigurerModel, action: string, subAction: string) {
  const formView = config?.views?.find((m) => m.id == action);
  const subFormView = config?.views?.find((m) => m.id == subAction);
  switch (name) {
    case 'add-search':
      config.searchFields = config.searchFields?.filter((m) => m != model);
      break;
    case 'add-button':
      config.buttons = config.buttons?.filter((m) => m !== model);
      break;
    case 'add-column':
      config.columns = config.columns?.filter((m) => m !== model);
      break;
    case 'add-group':
    case 'add-form':
      if (formView) {
        formView.groups = formView.groups?.filter((m) => m !== model);
      }
      break;
    case 'add-sub-form':
    case 'add-sub-group':
      subFormView.groups = subFormView.groups?.filter((m) => m !== model);
      break;
    case 'add-form-button':
      if (formView) {
        formView.buttons = formView.buttons?.filter((m) => m !== model);
      }
      break;
    case 'add-sub-form-button':
      if (subFormView) {
        subFormView.buttons = subFormView.buttons?.filter((m) => m !== model);
      }
      break;
  }

  return { ...config };
}