import { Statistic, type StatisticProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = StatisticProps

export default component.runtime('statistic', { type: 'display', valueType: 'string|number' })(
  Statistic,
);
