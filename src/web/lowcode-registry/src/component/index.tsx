import React, { useContext } from 'react';
import { Registrations } from '../dependency';
import SecurityWrapper, { ComponentContext, CreatorContext } from './SecurityWrapper';
import { hotRegister } from '../hot';
import { useFormInstance } from 'lowcode-kit';

export type Component = React.FC | React.ComponentType | React.ComponentClass

export interface ComponentCreation {
  name: string
  key: string
  parameters: Array<{ name: string, value: string }>
  options: Record<string, any>
  value?: any
  onChange?: (value: any) => void
}

export interface ComponentRegistration {
  // Component name
  name: string
  // Component type
  type?: 'input' | 'display'
  valueType?: string
  // Default property value
  initialValues?: Record<string, any>
  // Runtime component
  component: Component
  // Component designer
  designer?: Component
}

export type ComponentOptions = Omit<ComponentRegistration, 'name' | 'component' | 'designer'>

const idSymbol = Symbol.for('lowcode_id');

export class ComponentRegistry extends Registrations<ComponentRegistration> {
  CreatorContext = CreatorContext;

  ComponentContext = ComponentContext;

  useComponentContext = () => {
    return useContext(ComponentContext);
  };

  useCreator = () => {
    const form = useFormInstance();
    const data = useContext(CreatorContext);
    return {
      ...data,
      // Inside a form, live field values win over the creator's record.
      get model() {
        return form ? { ...data.model, ...form.getFieldsValue(true) } : data.model;
      },
    };
  };

  /**
   * Try to register a component; if it exists, return the registered config
   * @param name
   * @returns
   */
  private tryRegister(name: string) {
    const registration = this.getRegistration(name);
    if (!registration) {
      this.register({ name, component: null, designer: null });
    }
    return this.getRegistration(name);
  }

  /**
   * Register a component designer
   * @param name Component name; must matchruntimematch the registration name
   */
  design(runtime: Component) {
    return <T extends Component>(target: T) => {
      const name = runtime[idSymbol];
      const registration = this.tryRegister(name);
      registration.designer = target;
      return target;
    };
  }

  /**
   * Register a runtime component
   * @param name Component name
   * @returns
   */
  runtime(name: string, options?: ComponentOptions) {
    hotRegister.addUpdate(name);
    return <T extends Component>(target: T) => {
      target[idSymbol] = name;
      const registration = this.tryRegister(name);
      registration.type = options?.type || 'input';
      registration.initialValues = options?.initialValues || {};
      registration.component = target;
      registration.valueType = options?.valueType;
      return target;
    };
  }

  /**
   * Create a runtime component instance
   * @param meta Component creation context
   * @param model data the parent can pass to the current child component
   * @param props forcibly specified property data
   */
  create(meta: ComponentCreation, model?: Record<string, any>, props?: Record<string, any>, contextValue?: Record<string, any>, reason?: ComponentCreationReason) {
    // Copy: meta.options is the page schema itself, and writing row values into
    // it would leak data into the saved config and between rows.
    const options = { ...(meta?.options || {}) };
    model = model || {};
    meta?.parameters?.forEach((k) => {
      options[k.name] = model[k.value] || model[k.name];
    });
    Object.keys(options).forEach((name) => {
      if (options[name] === undefined) {
        delete options[name];
      }
    });
    if (!this.getRegistration(meta?.name)) {
      return null;
    };
    const realOptions = { ...(options || {}), ...(props || {}) };
    return (
      <SecurityWrapper
        model={contextValue}
        name={meta.name}
        reason={reason}
        registrations={this}
        options={realOptions}
      />
    );
  }
}

export default new ComponentRegistry();