import { Input, type InputProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = InputProps

export default component.runtime('input', { type: 'input', valueType: 'string' })(
  Input,
);
