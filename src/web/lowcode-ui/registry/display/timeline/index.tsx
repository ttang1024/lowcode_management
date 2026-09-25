import React from 'react';
import { Timeline, type TimelineProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ApiWrapper from '../../../src/api-wrapper';
import moment from 'moment';
import { format } from '../../utils';

export interface RuntimeProps extends TimelineProps {
  dateKey: string
  fmt: string
  template: string
  loading?: boolean
  data: any[]
  style?: React.CSSProperties
}

function TimelineRuntime({
  mode,
  reverse,
  loading,
  data,
  dateKey,
  fmt,
  template,
  style,
}: RuntimeProps) {
  return (
    <Timeline
      mode={mode}
      pending={loading}
      reverse={reverse}
      style={style}
      items={data?.map((item) => ({
        label: moment(item[dateKey]).format(fmt),
        children: format(template, item),
      }))}
    />
  );
}

export default component.runtime('timeline', { type: 'display', valueType: 'object[]' })(
  ApiWrapper.create('data', TimelineRuntime),
);
