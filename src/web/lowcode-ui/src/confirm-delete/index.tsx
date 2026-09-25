import React from 'react';
import { Button, ConfirmTyped } from 'lowcode-kit';

export interface ConfirmDeleteProps {
  title: React.ReactNode
  message?: React.ReactNode
  confirmKey: string
  onClick?: () => Promise<any>
}

/** Delete that requires typing `confirmKey` first. */
export default function ConfirmDelete(props: React.PropsWithChildren<ConfirmDeleteProps>) {
  return (
    <ConfirmTyped
      title={props.title}
      description={props.message}
      confirmText={props.confirmKey}
      onConfirm={() => props.onClick?.()}
    >
      {React.isValidElement(props.children) ? props.children as React.ReactElement : (
        <Button variant="danger-link" size="sm">{props.children || 'Delete'}</Button>
      )}
    </ConfirmTyped>
  );
}
