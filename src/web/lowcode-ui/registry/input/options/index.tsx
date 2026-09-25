import { component } from 'lowcode-registry';
import { OptionsPicker } from 'lowcode-blocks';

export type RuntimeProps = Parameters<typeof OptionsPicker>['0']

export default component.runtime('options-picker', { type: 'input', valueType: 'any' })(
  OptionsPicker,
);
