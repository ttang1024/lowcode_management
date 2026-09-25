import React from 'react';
import { GwImage } from 'lowcode-blocks';
import { component } from 'lowcode-registry';
import type { GwImageProps } from 'lowcode-blocks/src/gw-image';
import ValueWrapper from '../value-wrapper';
import fallback from './images/image_error.png';

export type RuntimeProps = GwImageProps

export function ImageRuntime(props:RuntimeProps) {
  return (
    <GwImage {...props} fallback={props.fallback || fallback} />
  );
}


export default component.runtime('image', { type: 'display', valueType: 'string' })(
  ValueWrapper.create('src', ImageRuntime),
);
