import React from 'react';
import { CardMeta } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { GwImage } from 'lowcode-blocks';

export interface RuntimeProps {
  avatar: string
  title: string
  description: string
  style?: React.CSSProperties
}

export function ListItem(props: RuntimeProps) {
  const avatar = props.avatar;
  return (
    <CardMeta
      style={props.style}
      avatar={avatar ? <GwImage width={32} height={32} src={avatar} preview={false} rootClassName="rounded-full" /> : undefined}
      title={props.title}
      description={props.description}
    />
  );
}

export default component.runtime('list-item', { type: 'display' })(ListItem);
