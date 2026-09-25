import { Badge, type BadgeProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ValueWrapper from '../value-wrapper';

export type RuntimeProps = BadgeProps

export default component.runtime('badge', { type: 'display', valueType: 'number' })(
  ValueWrapper.create('count', Badge),
);
