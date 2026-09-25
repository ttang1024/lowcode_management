import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import config from 'lowcode-configs';
import { Button, cn } from 'lowcode-kit';
import type { NavItem } from './menu';

export interface TopbarProps {
  current?: NavItem;
  pathname: string;
  /** Opens the navigation drawer; only set on compact screens. */
  onMenu?: () => void;
}

interface Crumb {
  title: string;
  href?: string;
}

// Deployments set ENV; locally it is empty, so fall back to the build mode.
const envName = config.ENV || (process.env.NODE_ENV === 'development' ? 'local' : '');

function useHeading(current: NavItem | undefined, pathname: string) {
  const appPage = /^\/admin\/([^/]+)\/page(\/|$)/.exec(pathname);
  if (current?.key === 'apps' && appPage) {
    const app = decodeURIComponent(appPage[1]);
    return {
      crumbs: [{ title: 'Apps', href: '/admin/app/list' }, { title: app }] as Crumb[],
      title: 'Pages',
      description: `Design, debug and publish the pages of “${app}”.`,
    };
  }
  return {
    crumbs: current ? [{ title: current.title }] : [] as Crumb[],
    title: current?.title ?? 'Not found',
    description: current?.description ?? '',
  };
}

const crumbLink = 'text-slate-500 no-underline hover:text-indigo-600';

export default function Topbar({ current, pathname, onMenu }: TopbarProps) {
  const { crumbs, title, description } = useHeading(current, pathname);

  return (
    <header className={cn('sticky top-0 z-20 flex items-start gap-4 bg-[#f4f6fb]/85 backdrop-blur-md backdrop-saturate-150', onMenu ? 'px-4 pt-3.5 pb-3' : 'px-8 pt-[22px] pb-[18px]')}>
      {onMenu && (
        <Button size="icon" className="mt-3.5" onClick={onMenu} aria-label="Open navigation">
          <Menu size="1em" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
          <Link to="/admin/overview" className={crumbLink}>Studio</Link>
          {crumbs.map((c) => (
            <React.Fragment key={c.title}>
              <ChevronRight size="1em" className="text-[9px] text-slate-400" />
              {c.href ? <Link to={c.href} className={crumbLink}>{c.title}</Link> : <span className="text-slate-900">{c.title}</span>}
            </React.Fragment>
          ))}
        </nav>
        <h1 className={cn('m-0 mt-1.5 leading-tight font-bold tracking-tight text-slate-900', onMenu ? 'text-[22px]' : 'text-[26px]')}>{title}</h1>
        {description && !onMenu && <p className="m-0 mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {envName && (
        <span title="Environment" className="mt-5 inline-flex h-[30px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold tracking-wider text-slate-700 uppercase">
          <i className="size-2 rounded-full bg-emerald-500 ring-3 ring-emerald-100" />
          {envName}
        </span>
      )}
    </header>
  );
}
