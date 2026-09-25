import React from 'react';
import { Comment, List } from 'lowcode-kit';
import { component } from 'lowcode-registry';
import { GwImage } from 'lowcode-blocks';
import DateView from '../date-view';
import ApiWrapper from '../../../src/api-wrapper';

export interface RuntimeProps {
  value: Record<string, any>[]
  fmt: string
  authorKey: string
  avatarKey: string
  contentKey: string
  dateTimeKey: string
  header: string
  style?: React.CSSProperties
}

function CommentsRuntime(props: RuntimeProps) {
  const value = props.value || [];
  if (value.length < 1) return null;
  const { authorKey, avatarKey, contentKey, dateTimeKey } = props;

  return (
    <List
      style={props.style}
      dataSource={value}
      header={props.header}
      renderItem={(item) => (
        <Comment
          author={item[authorKey]}
          avatar={<GwImage src={item[avatarKey]} preview={false} />}
          content={item[contentKey]}
          datetime={<DateView value={item[dateTimeKey]} fmt={props.fmt} />}
        />
      )}
    />
  );
}

export default component.runtime('comments', { type: 'display', valueType: 'object[]' })(
  ApiWrapper.create('value', CommentsRuntime),
);
