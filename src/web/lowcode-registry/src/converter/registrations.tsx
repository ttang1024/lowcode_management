import ConverterRegistry, { DATE_TIME_FORMAT } from './index';
import moment from 'moment';

type Moment = ReturnType<typeof moment>;

ConverterRegistry.register({
  name: 'moment',
  getValue: (v: Moment | Moment[], options: { fmt: string }) => {
    const fmt = options?.fmt || DATE_TIME_FORMAT;
    if (v instanceof Array) {
      return v.map((item) => item.format(fmt));
    }
    return v ? v.format(fmt) : null;
  },
  setInput: (v: string | string[], options: { fmt: string }) => {
    const fmt = options?.fmt || DATE_TIME_FORMAT;
    if (v instanceof Array) {
      return v.map((item) => moment(item, fmt));
    }
    return v ? moment(v, fmt) : null;
  },
});


ConverterRegistry.register({
  name: 'custom',
  getValue: (v: any, options: { getValue: (v: any) => any }) => {
    try {
      return options?.getValue ? options.getValue(v) : v;
    } catch (ex) {
      console.error(ex);
      return v;
    }
  },
  setInput: (v: any, options: { setValue: (v: any) => any }) => {
    try {
      return options?.setValue ? options.setValue(v) : v;
    } catch (ex) {
      console.error(ex);
      return v;
    }
  },
});