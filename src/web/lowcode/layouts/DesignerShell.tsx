import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, buttonClass } from 'lowcode-kit';
import { ArrowLeft, Eye } from 'lucide-react';
import config from 'lowcode-configs';
import { AppService, AppPageService } from 'lowcode-services';
import { BrandMark } from './Sidebar';

const BAR_HEIGHT = 64;

/** `/design/:app/:page/:action?` → its parts. */
function useDesignRoute() {
  const { pathname } = useLocation();
  const [, , app = '', page = '', action = 'list'] = pathname.split('/').map(decodeURIComponent);
  return { app, page, action };
}

// Display names for the app and page (codes are shown until they resolve).
function useNames(app: string, page: string) {
  const [names, setNames] = useState<{ app?: string; page?: string }>({});
  useEffect(() => {
    let alive = true;
    setNames({});
    const silent = (req: any) => (typeof req.silent === 'function' ? req.silent() : req);
    Promise.allSettled([
      silent(AppService.findAppByCode(app)),
      silent(AppPageService.pagedQueryPage({ pageNo: 1, pageSize: 20, query: { appCode: app, code: page } })),
    ]).then(([appRes, pageRes]) => {
      if (!alive) return;
      const appModel = appRes.status === 'fulfilled' ? appRes.value?.result : null;
      const pages = pageRes.status === 'fulfilled' ? pageRes.value?.result?.models || [] : [];
      setNames({ app: appModel?.name, page: pages.find((m: any) => m.code === page)?.name });
    });
    return () => {
      alive = false;
    };
  }, [app, page]);
  return names;
}

/**
 * Studio chrome around the page designer: a top bar (navigation, page identity,
 * preview and the designer's own tools, portalled into `#lc-designer-tools`)
 * above the live app rendered inside a framed canvas.
 */
export default function DesignerShell(props: React.PropsWithChildren) {
  const { app, page, action } = useDesignRoute();
  const names = useNames(app, page);
  const previewUrl = `${config.APP_BASE_URL || ''}/${encodeURIComponent(app)}/${encodeURIComponent(page)}`.replace(/^\/\//, '/');

  useEffect(() => {
    document.title = `${names.page || page} · Designer · Lowcode Studio`;
  }, [names.page, page]);

  // Inspector sheets float below the bar (see lowcode-kit `Sheet`).
  useEffect(() => {
    document.documentElement.style.setProperty('--lc-sheet-top', `${BAR_HEIGHT + 12}px`);
    return () => {
      document.documentElement.style.removeProperty('--lc-sheet-top');
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#eef1f7] bg-[radial-gradient(rgb(100_116_139/0.22)_1px,transparent_1px)] bg-[length:18px_18px] font-sans">
      <header style={{ height: BAR_HEIGHT }} className="relative z-[1001] flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white pr-4 pl-3 shadow-xs">
        <Tooltip title="Back to pages" side="bottom" align="start">
          <Link to={`/admin/${encodeURIComponent(app)}/page/list`} aria-label="Back to pages" className={buttonClass('ghost', 'icon', 'text-[15px]')}>
            <ArrowLeft size="1em" />
          </Link>
        </Tooltip>
        <BrandMark className="size-7" />
        <div className="flex min-w-0 flex-col pl-1">
          <div className="flex items-center gap-1.5 text-xs leading-snug text-slate-500">
            <Link to="/admin/app/list" className="text-slate-500 no-underline hover:text-indigo-600">Apps</Link>
            <span className="text-slate-300">/</span>
            <Link to={`/admin/${encodeURIComponent(app)}/page/list`} className="text-slate-500 no-underline hover:text-indigo-600">{names.app || app}</Link>
          </div>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-base font-bold tracking-tight text-slate-900">{names.page || page}</span>
            <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-px text-[11px] font-semibold whitespace-nowrap text-indigo-600">
              {action === 'list' ? 'List view' : `View · ${action}`}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <a href={previewUrl} target="_blank" rel="noreferrer" className={buttonClass('secondary', 'lg', 'max-[68.75rem]:w-10 max-[68.75rem]:px-0 max-[68.75rem]:[&>span:last-child]:hidden')}>
          <Eye size="1em" /> <span>Preview</span>
        </a>
        <div id="lc-designer-tools" className="flex min-h-[38px] items-center" />
      </header>

      <div className="min-h-0 flex-1 p-4">
        <div
          className={[
            'relative h-full overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgb(15_23_42/0.06),0_24px_48px_-24px_rgb(15_23_42/0.35)]',
            // App layouts size themselves to the viewport; inside the frame they fill it.
            '[&_.default-layout]:h-full [&_.mix-layout]:h-full [&_.top-layout]:h-full',
            // Fixed-position pieces of the app would escape the frame.
            '[&_.abstract-page-spinning]:absolute',
          ].join(' ')}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}
