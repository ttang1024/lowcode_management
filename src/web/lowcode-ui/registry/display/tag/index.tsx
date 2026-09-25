import { Tag, type TagProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ValueWrapper from '../value-wrapper';

export type RuntimeProps = TagProps;

export default component.runtime('tag', { type: 'display', valueType: 'string' })(
  ValueWrapper.create('children', Tag),
);
