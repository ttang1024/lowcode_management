/**
 * @module exception
 * @description Error/empty state view. Also exposes `NotFoundView` (a 404
 *   specialisation).
 */
import React from 'react';
import { Button, Result } from 'lowcode-kit';

export interface ExceptionProps {
  status?: '403' | '404' | '500' | 'error' | 'success' | 'info' | 'warning';
  /** Alias of `status` used by the app (`<Exception type="404" />`). */
  type?: string;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  desc?: React.ReactNode;
  extra?: React.ReactNode;
  btnText?: string;
  hideActions?: boolean;
  onBack?: () => void;
  onClick?: () => void;
  [key: string]: any;
}

// Numeric statuses read as the headline; the rest fall back to a title.
const HEADLINE = /^\d{3}$/;

const Exception: React.FC<ExceptionProps> = ({ status, type, title, subTitle, desc, extra, btnText, hideActions, onBack, onClick }) => {
  const code = String(type ?? status ?? 'error');
  const action = onClick || onBack;
  const button = !hideActions && action && btnText !== '' ?
    <Button variant="primary" onClick={action}>{btnText || 'Back'}</Button> :
    undefined;
  return (
    <Result
      status={HEADLINE.test(code) ? code : undefined}
      title={title ?? (HEADLINE.test(code) ? undefined : code)}
      description={subTitle ?? desc}
      action={extra ?? button}
    />
  );
};

export const NotFoundView: React.FC<ExceptionProps> = (props) => (
  <Exception status="404" title="Page not found" subTitle="The page you visited does not exist." {...props} />
);

export default Exception;
