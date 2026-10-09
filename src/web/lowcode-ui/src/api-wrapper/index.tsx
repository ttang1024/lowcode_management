/**
 * @module ApiWrapper
 * @description A wrapper component that fetches remote API data as its render sourceData source (wrapper component).
 */

import { AbstractProvider } from 'lowcode-blocks';
import dispatcher from 'lowcode-core/runtime/dispatcher';
import React, { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'lowcode-common';
import { useFormInstance } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export interface ApiWrapperResponse {
  result: any
}

export type ApiComponent<P> = React.FC<P> | React.ComponentType<P> | React.ComponentClass

export interface ApiWrapperProps<P, T> {
  value: T
  onChange: (value: T) => void
  component: ApiComponent<P>
  sourceAttr: string
  defaultSource?: any
  api?: ApiWrapperOptions
}

export interface ApiWrapperContextValue {
  data: Record<string, any>
}

const ApiWrapperContext = React.createContext<ApiWrapperContextValue>({ data: null });

export const ApiWrapperUIContext = React.createContext({ loading: false });

export function useFetchApiSource<P>(api: ApiWrapperOptions, format?: (data: any) => P) {
  const creator = component.useCreator();
  const context = useContext(ApiWrapperContext);
  const context2 = useContext(AbstractProvider.Context);
  const form = useFormInstance();
  const match = useRouteMatch();
  const [source, setSource] = useState<P>(null);
  const [loading, setLoading] = useState(false);

  const fetchApiSource = async(query?: Record<string, any>) => {
    const isEmpty = !api?.api && !api?.optionsKey && !api?.json;
    const formValues = creator?.model || form?.getFieldsValue() || {};
    if (isEmpty) return;
    setLoading(true);
    if (api.type == 'options') {
      // Dictionary data
      let optionResponse = await context2.fetchOption(api.optionsKey, { pageNo: 1, pageSize: 20 });
      if (optionResponse instanceof Array) {
        optionResponse = {
          models: optionResponse || [],
          count: optionResponse?.length,
        };
      }
      const response = optionResponse?.models;
      setSource(response as any as P);
      setLoading(false);
      return optionResponse;
    } else if (api.type == 'json') {
      setSource(api.json as any as P);
      setLoading(false);
      return { count: api.json?.length, models: api.json };
    } else if (api.type == 'none') {
      setSource(query as any as P);
      setLoading(false);
      return { count: query?.length, models: query };
    }
    const model = { ...context.data, ...formValues, ...query };
    const data = await dispatcher.api.callApi<ApiWrapperResponse>(api.api, model, match.params || {}, {}, undefined, query);
    let response = format ? format(data?.result || {}) : data?.result;
    if (response instanceof Array) {
      response = {
        models: response || [],
        count: response?.length,
      };
    }
    setSource(response as P);
    setLoading(false);
    return response;
  };

  return {
    refresh: fetchApiSource,
    response: source,
    loading,
  };
}


export default function ApiWrapper<P = any, T = any>({ defaultSource, component, sourceAttr, api, ...props }: ApiWrapperProps<P, T>) {
  const source = useFetchApiSource(api);
  const ApiComponent = component;

  useEffect(() => {source.refresh(props.value);}, [api, component]);

  if (!ApiComponent) return;

  const attrs = {
    ...props,
    [sourceAttr]: source?.response || defaultSource,
  } as any;

  return (
    <ApiWrapperUIContext.Provider
      value={{ loading: source.loading }}
    >
      <ApiComponent {...attrs} />
    </ApiWrapperUIContext.Provider>
  );
}

ApiWrapper.create = function <P, T>(name: string, component: ApiComponent<P>, defaultSource?: any) {
  return (props: ApiWrapperProps<P, T>) => {
    return <ApiWrapper {...props} defaultSource={defaultSource} sourceAttr={name} component={component} />;
  };
};