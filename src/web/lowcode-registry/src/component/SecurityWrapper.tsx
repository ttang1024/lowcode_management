import React from 'react';
import type { ComponentRegistry } from './index';
import { hotRegister } from '../hot';
import { Popover } from 'lowcode-kit';

export interface ComponentOption {
  [x: string]: any
}

export interface SecurityWrapperProps {
  name: string
  reason: ComponentCreationReason
  registrations: ComponentRegistry
  options: ComponentOption
  model: Record<string, any> | (() => Record<string, any>)
}

interface CreatorContextValue {
  model: Record<string, any>
}

export interface ComponentContextValue {
  apiResponse: (data: { response: any, closeOnSubmit: boolean, refresh: ReloadTypes, message: string }) => void
  dispatchButtonEvent: (button: { event?: EventConfigurerModel }, row: any, isSubView?: boolean) => void
}

export const ComponentContext = React.createContext<ComponentContextValue>({
  apiResponse: () => { },
  dispatchButtonEvent: () => { },
});

export const CreatorContext = React.createContext<CreatorContextValue>({ model: {} });

export default class SecurityWrapper extends React.Component<SecurityWrapperProps> {
  state = {
    error: null,
  };

  isCleaning = false;

  static hotUpdates = [] as string[];

  static getDerivedStateFromError(error: Error) {
    return {
      error: error,
    };
  }

  creatorContext: CreatorContextValue;

  constructor(props) {
    super(props);
    hotRegister.addInstance(this);
    this.creatorContext = {
      get model() {
        const { model } = props;
        if (typeof model == 'function') {
          return model() || {};
        }
        return model || {};
      },
    };
  }

  renderErrorUI() {
    return (
      <Popover
        className="max-w-[600px]"
        content={<pre className="m-0 max-h-80 overflow-auto text-xs whitespace-pre-wrap text-red-700">{this.state.error?.stack || ''}</pre>}
      >
        <button type="button" className="cursor-pointer text-left text-sm text-red-600 underline decoration-dotted">
          Component render error — please contact the administrator
        </button>
      </Popover>
    );
  }

  shouldComponentUpdate(): boolean {
    if (this.isCleaning) {
      this.isCleaning = false;
      return false;
    }
    return true;
  }

  componentDidUpdate(): void {
    if (this.state.error) {
      this.isCleaning = true;
      this.setState({ error: null });
    }
  }

  componentWillUnmount(): void {
    hotRegister.removeInstance(this);
  }

  render(): React.ReactNode {
    const { registrations, name, options, reason, ...others } = this.props;

    const UseComponent = registrations.getRegistration(name)?.component as React.FC<any>;
    if (!UseComponent) {
      return null;
    }
    if (this.state.error) {
      return this.renderErrorUI();
    }
    return (
      <CreatorContext.Provider
        value={this.creatorContext}
      >
        {<UseComponent {...options} {...others} />}
      </CreatorContext.Provider>
    );
  }
}