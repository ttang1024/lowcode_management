import React from 'react';
import DiffView from '../diff-view';

export interface ResourceDiffViewProps {
  open: boolean
  onCancel?: () => void
  onOk?: (content: string) => void
  oldValue: string
  newValue: string
  leftTitle: React.ReactNode
  rightTitle: React.ReactNode
  title: React.ReactNode
}

export default function ResourceDiffView(props: ResourceDiffViewProps) {
  return (
    <DiffView
      open={props.open}
      title={props.title}
      oldValue={props.oldValue}
      newValue={props.newValue}
      leftTitle={props.leftTitle}
      rightTitle={props.rightTitle}
      onCancel={props.onCancel}
      onSubmit={props.onOk}
    />
  );
}