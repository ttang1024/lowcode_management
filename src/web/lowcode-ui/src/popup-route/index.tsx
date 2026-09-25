import React, { useState } from 'react';
import { Dialog } from 'lowcode-kit';

type CreateRouter = (path: string) => React.ReactElement | React.ReactNode

const runtime = {
  createRouter: null as CreateRouter,
};

export interface PopupRouteProps {
  path: string
  title?: React.ReactNode
  innerClass?: string
  onCancel?: () => void
  children?: React.ReactNode
}

/** Opens another studio route full-screen in a dialog (e.g. edit an API without leaving the designer). */
export default function PopupRoute(props: PopupRouteProps) {
  const { path, innerClass, title } = props;
  const [visible, setVisible] = useState(false);
  if (!runtime.createRouter) return null;

  const onCancel = () => {
    setVisible(false);
    props.onCancel?.();
  };

  return (
    <React.Fragment>
      <div className={innerClass} onClick={() => setVisible(true)}>
        {props.children}
      </div>
      <Dialog
        open={visible}
        onClose={onCancel}
        title={title || 'Details'}
        width="calc(100vw - 48px)"
        className="lowcode-admin-wrapper top-6 h-[calc(100vh-48px)] max-h-none"
        bodyClassName="lc-self-container rounded-b-2xl bg-slate-50 py-4 [&>div]:bg-white"
      >
        {visible && runtime.createRouter(path)}
      </Dialog>
    </React.Fragment>
  );
}

PopupRoute.register = (router: CreateRouter) => {
  runtime.createRouter = router;
};
