import React from 'react';
import { createRoot } from 'react-dom/client';
import type { RegistryContextValue } from './context';
import FallbackContainer from './FallbackContainer';

export type GyApplication = React.FC<{ ctx: RegistryContextValue }>

export interface RegistryRuntime {
  GyApplication: GyApplication
}

const runtime: RegistryRuntime = {} as RegistryRuntime;

export const registerApplication = (App: GyApplication) => {
  runtime.GyApplication = App;
};

export function renderApplication({ root, ...props }: RegistryContextValue & { root: HTMLElement }) {
  const appRef = React.createRef<ApplicationRunner>();
  const appInstance = createRoot(root);
  appInstance.render(<ApplicationRunner {...props} ref={appRef} />);
  return {
    destory: () => {
      appInstance.unmount();
    },
    refresh: () => {
      appRef.current?.forceUpdate();
    },
  };
}

export default class ApplicationRunner extends React.Component<RegistryContextValue> {
  static FallbackContainer = FallbackContainer;

  static renderApplication = renderApplication;

  static registerApplication = registerApplication;

  render() {
    const GyApplication = runtime.GyApplication;
    const design = this.props.design;
    const ctx = {
      ...this.props,
      design: design,
    };
    return (
      <GyApplication ctx={ctx} />
    );
  }
}

