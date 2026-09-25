import type React from 'react';
import type { FormInstance, FormRule, FormRuleItem } from 'lowcode-kit';
import { Registrations, type RegistrationBase } from '../dependency';

interface ValidatorOptions {
  config: any
  message?: string
}

export interface RulerRegistration extends RegistrationBase {
  title: string
  input?: React.ReactElement
  message?: string
  validator?: (rule: FormRule, value: any, form: FormInstance, options: ValidatorOptions) => Promise<any>
}

const registrations = new Registrations<RulerRegistration>();

export default class RulerRegistry {
  static getRegistration(name: string) {
    return registrations.getRegistration(name);
  }

  static getAllRegistrations() {
    return registrations.getAllRegistrations();
  }

  static register(registration: RulerRegistration | RulerRegistration[]) {
    return registrations.register(registration);
  }

  static mergeRegister(register: Partial<RulerRegistration>) {
    const registration = this.getRegistration(register.name);
    if (registration) {
      registration.input = register.input;
    }
  }

  static getRule(name: string, options?: ValidatorOptions): FormRuleItem {
    const registration = this.getRegistration(name);
    if (registration) {
      const validator = registration.validator;
      return (form: FormInstance) => {
        return {
          message: options?.message || registration?.message,
          validator: !validator ? undefined : (rule, value) => {
            return validator(rule, value, form, options || { config: undefined }).catch((message:string)=>{
              rule.message = message;
              return Promise.reject(message);
            });
          },
        };
      };
    }
  }
}

