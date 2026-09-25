import { type AbstractGroups, Registrations, ConverterRegistry as Registry, type ValueConverter } from '../dependency';


/** Default date-time format used by the moment converter and date display components. */
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface ConverterOptions {
  name: string
  options?: AbstractGroups<any>
}

type ConverterOptionsRegistration = ValueConverter & ConverterOptions;

const registrations = new Registrations<ConverterOptionsRegistration>();

export default class ConverterRegistry {
  static getRegistration(name: string) {
    return registrations.getRegistration(name);
  }

  static getAllRegistrations() {
    return registrations.getAllRegistrations();
  }

  static register(registration: ConverterOptionsRegistration | ConverterOptionsRegistration[]) {
    const all = registration instanceof Array ? registration : [registration];
    all.forEach((item) => {
      Registry.register({
        name: item.name,
        getValue: item.getValue,
        setInput: item.setInput,
      });
    });
    return registrations.register(registration);
  }

  static setOptions(config:ConverterOptions) {
    const registration = this.getRegistration(config.name);
    if (registration) {
      registration.options = config.options;
    }
  }
}

