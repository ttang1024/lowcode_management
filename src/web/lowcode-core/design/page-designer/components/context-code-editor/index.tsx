import type { AutoCompletion } from 'lowcode-ui/src/code-editor';
import { useContext, useMemo } from 'react';
import { LowcodeNodeContext, type PageNodeContextValue } from '../../../lowcode-designer';
import { store } from '../../../../provider';

export type ContextScenario = 'form' | 'table' | 'search' | 'form-button' | 'table-button' | ''

const getCompletions = (model: Record<string, any>, items: Array<{ name: string, title: string }>) => {
  const completions = [] as AutoCompletion[];
  const keys = Object.keys(model || {});
  const keyMap = keys.reduce((map, key) => (map[key] = true, map), {});
  items?.forEach((item) => {
    keyMap[item.name] = false;
    completions.push({
      value: item.name,
      meta: item.title,
    });
  });
  Object.keys(keyMap).forEach((key) => {
    if (keyMap[key]) {
      completions.push(key);
    }
  });
  const useCompletetions = completions.map((item) => {
    if (typeof item == 'string') {
      return item;
    }
    return {
      value: item.value,
      meta: item.meta,
    };
  });
  return [
    ...useCompletetions,
  ] as AutoCompletion[];
};

const getIncrementKeys = (model: Record<string, any>, items: Array<{ name: string, title: string }>) => {
  items = items || [];
  return Object.keys(model || {}).filter((name) => !items.find((m) => m.name == name));
};

const createScenarioCompletions = (scenario: ContextScenario, context: PageNodeContextValue) => {
  switch (scenario) {
    case 'form':
    {
      const options = context.options;
      const isSubAction = !!options.subAction;
      const model = isSubAction ? options.subRecord : options.record;
      const viewConfig = isSubAction ? options.subActionView : options.actionView;
      const keys = getCompletions(model, viewConfig?.groups || []);
      return {
        keys,
        incrementKeys: getIncrementKeys(model, viewConfig?.groups || []),
      };
    }
    case 'table':
    {
      const models = context.options?.allRecords?.models || [];
      const model = models[0];
      const keys = getCompletions(model, context.data?.columns || []);
      return {
        keys,
        incrementKeys: getIncrementKeys(model, context.data?.columns || []),
      };
    }
    case 'search':
    {
      const model = { 'pageIndex': '', 'pageSize': '', 'sort': '', 'order': '' };
      const models = context.options?.allRecords?.models || [];
      const model2 = models[0];
      const keys = getCompletions(model, context.data?.searchFields);
      return {
        keys,
        incrementKeys: getIncrementKeys(model2, context.data?.searchFields),
      };
    }
    default:
      return {
        keys: [],
        incrementKeys: [],
      };
  }
};

const useAutoCompletions = (scenario: ContextScenario, context: PageNodeContextValue) => {
  return useMemo(() => {
    const result = createScenarioCompletions(scenario, context);
    const page = store.getPageState();
    Object.keys(page).forEach((k) => {
      result.keys.push({ value: 'page.' + k, meta: 'variable', full: true });
    });
    return result;
  }, [scenario, context]);
};

export const useScenarioCompletions = (scenario?: ContextScenario) => {
  const context = useContext(LowcodeNodeContext);
  const res = useAutoCompletions(scenario, context);
  return {
    keys: res.keys,
    incrementKeys: res.incrementKeys,
    scenario,
  };
};