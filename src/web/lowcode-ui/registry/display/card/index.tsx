import React from 'react';
import { Card, type CardProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { GwImage } from 'lowcode-blocks';

export interface RuntimeProps extends Omit<CardProps, 'cover'> {
  cover: string
  metaTitle: string
  description: string
  child: ComponentModel
  style?: React.CSSProperties
}

export function CardRuntime({ child, cover, description, metaTitle, title, ...props }: RuntimeProps) {
  return (
    <Card
      {...props}
      // A header or cover gives the card its padded layout.
      title={title || undefined}
      cover={cover ? <GwImage src={cover} preview={false} rootClassName="w-full" /> : undefined}
      className={title || cover ? undefined : 'p-5'}
    >
      {(metaTitle || description) && <Card.Meta title={metaTitle} description={description} />}
      {child && component.create(child, {})}
    </Card>
  );
}

export default component.runtime('card', { type: 'display' })(
  CardRuntime,
);
