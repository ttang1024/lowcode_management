import { component } from 'lowcode-registry';
import { OptionsPicker } from 'lowcode-blocks';

const OptionsView = OptionsPicker.OptionsView;

export type RuntimeProps = Parameters<typeof OptionsView>['0']

export default component.runtime('enums', { type: 'display', valueType: 'string|number' })(
  OptionsView,
);
