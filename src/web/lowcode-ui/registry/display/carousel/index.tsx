import React from 'react';
import { Carousel, type CarouselProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { GwImage } from 'lowcode-blocks';

export interface RuntimeProps extends CarouselProps {
  style?: React.CSSProperties
  items: string[]
}

export function CarouselRuntime({ items, style, ...props }: RuntimeProps) {
  const size = { ...style, width: style?.width || 300, height: style?.height || 200 };
  return (
    <Carousel {...props} style={size}>
      {items?.map((item, index) => (
        <GwImage key={index} src={item} preview={false} rootClassName="size-full" style={{ height: size.height }} />
      ))}
    </Carousel>
  );
}

export default component.runtime('carousel', { type: 'display' })(
  CarouselRuntime,
);
