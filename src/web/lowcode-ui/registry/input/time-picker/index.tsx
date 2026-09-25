import React from 'react';
import { TimePicker, type TimePickerProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = TimePickerProps

export function TimePickerRuntime(props: RuntimeProps) {
  return <TimePicker {...props} />;
}

export default component.runtime('time-picker', { type: 'input', valueType: 'moment' })(TimePickerRuntime);
