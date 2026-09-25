import React from 'react';
import { component } from 'lowcode-registry';
import { RangePicker, type RangePickerProps } from 'lowcode-kit';
import moment from 'moment';
import dispatcher from 'lowcode-core/runtime/dispatcher';

export type RuntimeProps = Omit<RangePickerProps, 'disabledDate'> & {
  disabledDate: string
}

export function DateRangePickerRuntime(props: RuntimeProps) {
  const { disabledDate, ...others } = props;
  const creator = component.useCreator();
  const useDisabledDate = (date) => {
    const current = moment();
    return dispatcher.fn.exec(disabledDate, ['date', 'today', 'moment', 'context'], [date, current, moment, creator.model]);
  };
  return <RangePicker {...others} disabledDate={disabledDate ? useDisabledDate : undefined} />;
}

export default component.runtime('date-range-picker', { type: 'input', valueType: 'moment' })(
  DateRangePickerRuntime,
);
