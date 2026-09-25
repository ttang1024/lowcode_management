import React from 'react';
import { DATE_TIME_FORMAT, component } from 'lowcode-registry';
import moment from 'moment';

export interface RuntimeProps {
  value: string
  fmt: string
  style?: React.CSSProperties
}

export function DateViewRuntime(props: RuntimeProps) {
  const instance = props.value ? moment(props.value) : null;
  return <span style={props.style}>{instance?.format(props.fmt || DATE_TIME_FORMAT) || ''}</span>;
}

export default component.runtime('date-view', { type: 'display', valueType: 'string' })(
  DateViewRuntime,
);
