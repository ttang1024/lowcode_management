// props are typed via TS; the rule misreads the augmented component type.
/**
 * @module page-header
 * @description Page header with title, back button and an extra slot.
 *   `OverridePageHeader` exposes `.Container` (content wrapper) and `.PageHeader`
 *   (header with title/subTitle/breadcrumb/extra) as used by the layouts.
 */
import React from 'react';
import { Button, cn } from 'lowcode-kit';
import type { PageHeaderProps } from '../interface';

export type { PageHeaderProps };

const PageHeader: React.FC<PageHeaderProps> = (props) => {
  // Routing/breadcrumb hints from the layouts are not DOM attributes.
  const { title, subTitle, onBack, extra, footer, children, visible, appendRoutes, breadcrumb, breadcrumbRender, ...rest } = props;
  if (visible === false) return null;
  return (
    <div {...rest} className={cn('lc-page-header mb-3 py-3', rest.className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-2">
          {onBack && <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back">←</Button>}
          <span className="truncate text-lg font-semibold text-slate-900">{title}</span>
          {subTitle && <span className="text-sm text-slate-500">{subTitle}</span>}
        </div>
        <div>{extra}</div>
      </div>
      {children}
      {footer}
    </div>
  );
};

/** Wrapper around the header + page content. */
const Container: React.FC<{ className?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ className, style, children }) => {
  return <div className={`lc-page-header-container ${className || ''}`} style={style}>{children}</div>;
};

/**
 * Header variant used inside {@link Container}: renders the breadcrumb (via the
 * caller's `breadcrumbRender`), the title/subTitle row and an `extra` slot.
 * `breadcrumb`/`breadcrumbRender` are kept off the DOM node.
 */
const HeaderView: React.FC<PageHeaderProps & { breadcrumbRender?: (props: any) => React.ReactNode }> = (props) => {
  const { title, subTitle, extra, footer, className, breadcrumbRender, children } = props as any;
  return (
    <div className={cn('lc-page-header mb-3 py-3', className)}>
      {typeof breadcrumbRender === 'function' ? breadcrumbRender(props) : null}
      <div className="lc-page-header-heading flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-lg font-semibold text-slate-900">{title}</span>
          {subTitle && <span className="text-sm text-slate-500">{subTitle}</span>}
        </div>
        <div>{extra}</div>
      </div>
      {children}
      {footer}
    </div>
  );
};

type OverridePageHeaderType = React.FC<PageHeaderProps> & {
  Container: typeof Container;
  PageHeader: typeof HeaderView;
};

export const OverridePageHeader = PageHeader as OverridePageHeaderType;
OverridePageHeader.Container = Container;
OverridePageHeader.PageHeader = HeaderView;

export default PageHeader;
