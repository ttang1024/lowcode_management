import { Alert, type AlertProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ValueWrapper from '../value-wrapper';

export type RuntimeProps = AlertProps

export default component.runtime('alert', { type: 'display', valueType: 'string' })(
  ValueWrapper.create('message', Alert),
);
