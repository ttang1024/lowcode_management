import React from 'react';
import { component } from 'lowcode-registry';
import moment from 'moment';

export interface RuntimeProps {
  fmt: string
  startKey: string
  endKey: string
  joinChar: string
  model?: Record<string, any>
  style?: React.CSSProperties
}

function DateRangeRuntime(props: RuntimeProps) {
  const { startKey, endKey, joinChar, fmt = 'YYYY-MM-DD', model = {} } = props;
  const start = model[startKey] || '';
  const end = model[endKey] || '';
  const startText = start ? moment(start).format(fmt) : '';
  const endText = end ? moment(end).format(fmt) : '';
  if (!startText && !endText) return null;
  return (
    <div style={props.style} >{startText}{joinChar || '-'} {endText}</div>
  );
}

export default component.runtime('date-range', { type: 'display' })(
  DateRangeRuntime,
);
