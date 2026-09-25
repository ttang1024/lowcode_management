
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { LowcodeNodeContextValue, SubmitInterceptor } from '../abstract-designer';
import type { PageDesignerProps } from '../page-designer';
import type { LayoutDesignerProps } from '../layout-designer';

interface DesignerContextValue {
  enable: boolean
  resolveConflict?: (cache: PageConfigurerModel, latest: PageConfigurerModel) => Promise<PageConfigurerModel>
}

const runtime = {
  AbstractDesigner: null as typeof import('../abstract-designer').default,
};

export type LowcodeDesignerProps = PageDesignerProps | LayoutDesignerProps

export type PageNodeContextValue = LowcodeNodeContextValue<PageDesignerProps>

export type LayoutNodeContextValue = LowcodeNodeContextValue<LayoutDesignerProps>


export const DesignerContext = React.createContext<DesignerContextValue>({ enable: false, resolveConflict: null });

export const LowcodeNodeContext = React.createContext<LowcodeNodeContextValue<any>>({

});

function useSubmiter(handler: LowcodeDesignerProps['onSubmit']) {
  const memo = useRef({
    interceptors: [] as SubmitInterceptor<any>[],
  });

  const clearInterceptors = useCallback(() => {
    memo.current.interceptors.length = 0;
  }, []);

  const onSubmit = useCallback((data: any, isRevert: boolean) => {
    if (!isRevert) {
      memo.current.interceptors.forEach((interceptor) => {
        interceptor(data);
      });
    }
    handler(data);
    clearInterceptors();
  }, [handler]);

  function useSubmit<T>(handler: SubmitInterceptor<T>) {
    useEffect(() => {
      memo.current.interceptors.push(handler);
    }, []);
  };

  useEffect(() => {
    return () => {
      clearInterceptors();
    };
  }, []);

  return {
    onSubmit,
    useSubmit,
    clearInterceptors,
  };
}

export default function LowcodeDesigner(props: React.PropsWithChildren<LowcodeDesignerProps>) {
  const { data } = props;
  const [isReady, setIsReady] = useState<boolean>();
  const designerContext = useContext(DesignerContext);
  const AbstractDesigner = runtime.AbstractDesigner;
  const submiter = useSubmiter(props.onSubmit);
  const context: LowcodeNodeContextValue<typeof props> = useMemo(() => {
    return {
      data: data,
      options: props.options,
      onSubmit: submiter.onSubmit,
      useSubmit: submiter.useSubmit,
      clearSubmitInterceptors: submiter.clearInterceptors,
      onValuesChanged: props.onValuesChanged,
    };
  }, [data, submiter, props.options, props.onSubmit, props.onValuesChanged]);

  const initializeDesigner = () => {
    if (designerContext.enable) {
      // the designer is loaded asynchronously here
      import(/* webpackChunkName: "designers" */'../abstract-designer/index').then((res) => {
        runtime.AbstractDesigner = res.default;
        setIsReady(true);
      });
    }
  };

  useEffect(initializeDesigner, [props.type]);

  const renderBody = () => {
    if (!isReady) {
      return null;
    }
    return (
      <AbstractDesigner {...props} onSubmit={submiter.onSubmit} data={data as any} >
        {props.children}
      </AbstractDesigner>
    );
  };

  return (
    <React.Fragment>
      <LowcodeNodeContext.Provider value={context}>
        <div className="lowcode-designer-wrapper size-full">
          {designerContext.enable ? renderBody() : props.children}
        </div>
      </LowcodeNodeContext.Provider>
    </React.Fragment>
  );
}

// Design context
LowcodeDesigner.Provider = DesignerContext.Provider;

// Design node context
LowcodeDesigner.NodeContext = LowcodeNodeContext;

export function usePageNodeContext() {
  return useContext(LowcodeNodeContext) as PageNodeContextValue;
}