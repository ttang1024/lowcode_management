import { component } from 'lowcode-registry';
import IconPicker from '../../../src/app-icon-picker';

export interface RuntimeProps {

}

export default component.runtime('icon-picker', { type: 'input', valueType: 'string' })(
  IconPicker,
);
