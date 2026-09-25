import React from 'react';
import Runtime, { type RuntimeProps } from './index';
import { DATE_TIME_FORMAT, component } from 'lowcode-registry';
import { AbstractForm, type AbstractGroups } from 'lowcode-blocks';
import { Input } from 'lowcode-kit';
import ApiWrapperPicker from '../../../src/api-wrapper-picker';

const responseDemo = [];

function CommentsDesigner() {
  const groups: AbstractGroups<RuntimeProps> = [
    {
      title: 'Title',
      name: 'header',
      render: <Input />,
    },
    {
      title: 'Author field',
      name: 'authorKey',
      initialValue: 'author',
      render: <Input />,
    },
    {
      title: 'Avatar field',
      name: 'avatarKey',
      initialValue: 'avatar',
      render: <Input />,
    },
    {
      title: 'Time field',
      name: 'dateTimeKey',
      initialValue: 'datetime',
      render: <Input />,
    },
    {
      title: 'Date format',
      name: 'fmt',
      initialValue: DATE_TIME_FORMAT,
      render: <Input />,
    },
    {
      title: 'Content field',
      name: 'contentKey',
      initialValue: 'content',
      render: <Input />,
    },
    { title: 'Data source', name: 'api', render2: <ApiWrapperPicker responseDemo={responseDemo} /> },
  ];

  return (
    <AbstractForm
      groups={groups}
    />
  );
}

export default component.design(Runtime)(CommentsDesigner);
