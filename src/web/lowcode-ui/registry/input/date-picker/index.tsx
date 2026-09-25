import React from 'react';
import { DatePicker, type DatePickerProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import moment from 'moment';
import dispatcher from 'lowcode-core/runtime/dispatcher';

export type RuntimeProps = Omit<DatePickerProps, 'disabledDate'> & {
  disabledDate: string
  format?: string
  converter?: [string, { fmt: string }]
}

export function DatePickerRuntime(props: RuntimeProps) {
  const { disabledDate, value, converter, ...others } = props;
  const creator = component.useCreator();
  const format = (converter || [])[1]?.fmt;
  const useDisabledDate = (date) => {
    const current = moment();
    return dispatcher.fn.exec(disabledDate, ['date', 'today', 'moment', 'context'], [date, current, moment, creator.model]);
  };

  const useValue = moment.isMoment(value) ? value : null;

  return <DatePicker {...others} format={format || props.format} value={useValue} disabledDate={disabledDate ? useDisabledDate : undefined} />;
}

export default component.runtime('date-picker', { type: 'input', valueType: 'moment' })(
  DatePickerRuntime,
);
