import { Textarea, type TextareaProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = TextareaProps

export default component.runtime('textarea', { type: 'input', valueType: 'string' })(Textarea);
