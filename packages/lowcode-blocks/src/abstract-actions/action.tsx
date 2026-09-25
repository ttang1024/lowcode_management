/**
 * @module abstract-actions/action
 * @description A button that opens a side sheet to host a form/detail view.
 */
import React, { useState } from 'react';
import { Button, Sheet } from 'lowcode-kit';
import type { DrawerActionProps } from '../interface';

export type { DrawerActionProps };

export interface DrawerActionComponentProps extends DrawerActionProps {
  children?: React.ReactNode | ((close: () => void) => React.ReactNode);
}

const DrawerAction: React.FC<DrawerActionComponentProps> = ({ text, title, icon, type, width = 520, onClick, children }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant={type === 'primary' ? 'primary' : 'link'} icon={icon} onClick={() => {setOpen(true); onClick?.(undefined as any);}}>
        {text ?? title}
      </Button>
      <Sheet title={title} width={width} open={open} onClose={close}>
        {open && (typeof children === 'function' ? (children as any)(close) : children)}
      </Sheet>
    </>
  );
};

export default DrawerAction;
