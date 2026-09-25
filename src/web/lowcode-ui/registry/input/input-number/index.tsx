import { InputNumber, type InputNumberProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = InputNumberProps

export default component.runtime('input-number', { type: 'input', valueType: 'number' })(
  InputNumber,
);
