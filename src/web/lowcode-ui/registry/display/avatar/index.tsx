import { Avatar, type AvatarProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import ValueWrapper from '../value-wrapper';

export type RuntimeProps = AvatarProps

export default component.runtime('avatar', { type: 'display', valueType: 'string' })(
  ValueWrapper.create('src', Avatar),
);
