import React from 'react';
import { Image } from 'lowcode-kit';
import { GwImage } from 'lowcode-blocks';
import { component } from 'lowcode-registry';
import type { GwImageProps } from 'lowcode-blocks/src/gw-image';

export type RuntimeProps = GwImageProps & {
  value: string[] | string
}

export function ImageGalleryRuntime({ value, ...props }: RuntimeProps) {
  const items = value instanceof Array ? value : [value];
  return (
    <div className="flex flex-wrap gap-2.5 pt-1">
      <Image.PreviewGroup>
        {items.filter(Boolean).map((item, index) => <GwImage {...props} src={item} key={index} />)}
      </Image.PreviewGroup>
    </div>
  );
}

export default component.runtime('image-gallery', { type: 'display', valueType: 'string|string[]' })(
  ImageGalleryRuntime,
);
