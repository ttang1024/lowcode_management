import React, { useCallback, useContext, useRef, useEffect } from 'react';
import { RegistryContext } from './context';

interface RuntimeRef {
  element: HTMLDivElement
  destory: () => void
}

export interface FallbackContainerProps {
  style?: React.CSSProperties
}

export default function FallbackContainer(props: FallbackContainerProps) {
  const context = useContext(RegistryContext);
  const runtimeRef = useRef({} as RuntimeRef);

  const portalRenderHandler = useCallback((element) => {
    const runtime = runtimeRef.current;
    if (runtime.element != element) {
      runtime.destory?.();
      runtime.element = element;
      if (element) {
        const render = context.injectRouter?.();
        runtime.destory = render?.(element, {});
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      runtimeRef.current?.destory?.();
    };
  }, []);

  return (
    <div style={props.style} ref={context.extendRouter ? null : portalRenderHandler} >
      {context.extendRouter}
    </div>
  );
}