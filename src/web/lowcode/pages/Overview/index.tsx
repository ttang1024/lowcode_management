/**
 * @module Overview
 * @description Workspace dashboard: totals per section, recent apps and a
 *   getting-started path for new workspaces.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, LayoutGrid, Plug, Plus, SlidersHorizontal, SquareFunction } from 'lucide-react';
import {
  AppService,
  AppPageService,
  ApisService,
  OptionsService,
  FunctionsService,
  EnvVariablesService,
} from 'lowcode-services';
import { Card, Skeleton, SkeletonLines, buttonClass, cn } from 'lowcode-kit';
import { StatusPill } from '../shared/components';

interface Stat {
  key: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  load: () => PromiseLike<any>;
}

// Icon chip colours per section (static so Tailwind sees the classes).
const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
};

// Only the total is needed, so ask for a single row.
const COUNT_QUERY = { pageNo: 1, pageSize: 1 };

// Background fetches: a failure shows as "—" rather than an error toast.
const silent = (req: any) => (typeof req.silent === 'function' ? req.silent() : req);

const stats: Stat[] = [
  { key: 'apps', title: 'Apps', href: '/admin/app/list', icon: <LayoutGrid size="1em" />, tone: 'indigo', load: () => silent(AppService.pagedQuery(COUNT_QUERY)) },
  { key: 'pages', title: 'Pages', href: '/admin/app/list', icon: <FileText size="1em" />, tone: 'sky', load: () => silent(AppPageService.pagedQueryPage(COUNT_QUERY)) },
  { key: 'apis', title: 'APIs', href: '/admin/apis/list', icon: <Plug size="1em" />, tone: 'emerald', load: () => silent(ApisService.pagedQueryApi(COUNT_QUERY)) },
  { key: 'options', title: 'Dictionaries', href: '/admin/options/list', icon: <BookOpen size="1em" />, tone: 'amber', load: () => silent(OptionsService.pagedQueryOptions(COUNT_QUERY)) },
  { key: 'functions', title: 'Functions', href: '/admin/functions/list', icon: <SquareFunction size="1em" />, tone: 'violet', load: () => silent(FunctionsService.pagedQueryOptions(COUNT_QUERY)) },
  { key: 'env', title: 'Config variables', href: '/admin/env/list', icon: <SlidersHorizontal size="1em" />, tone: 'rose', load: () => silent(EnvVariablesService.pagedQueryVariable(COUNT_QUERY)) },
];

const steps = [
  { title: 'Create an app', text: 'An app groups pages and navigation.', href: '/admin/app/list' },
  { title: 'Connect your data', text: 'Register APIs and dictionaries that pages read from.', href: '/admin/apis/list' },
  { title: 'Design pages', text: 'Open a page in the designer and compose it visually.', href: '/admin/app/list' },
  { title: 'Publish', text: 'Publish the app and its pages to make them live.', href: '/admin/app/list' },
];

type Counts = Record<string, number | null>;

function useOverview() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [apps, setApps] = useState<any[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled(stats.map((s) => s.load())).then((results) => {
      if (!alive) return;
      const next: Counts = {};
      results.forEach((r, i) => {
        next[stats[i].key] = r.status === 'fulfilled' ? (r.value?.result?.count ?? 0) : null;
      });
      setCounts(next);
    });
    Promise.resolve(silent(AppService.pagedQuery({ pageNo: 1, pageSize: 6, sort: 'id', order: 'descend' })))
      .then((res: any) => alive && setApps(res?.result?.models || []))
      .catch(() => alive && setApps([]));
    return () => {
      alive = false;
    };
  }, []);

  return { counts, apps };
}

function StatCard({ stat, value }: { stat: Stat; value: number | null | undefined }) {
  return (
    <Link
      to={stat.href}
      className="group relative flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-[18px] text-slate-700 no-underline shadow-card transition duration-150 hover:-translate-y-0.5 hover:border-transparent hover:text-slate-700 hover:shadow-float"
    >
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl text-xl', TONES[stat.tone])}>{stat.icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium text-slate-500">{stat.title}</span>
        {value === undefined ?
          <Skeleton className="mt-1.5 h-6 w-12" /> :
          <span className="text-[26px] leading-tight font-bold tracking-tight text-slate-900 tabular-nums">{value === null ? '—' : value.toLocaleString()}</span>}
      </span>
      <ArrowRight size="1em" className="absolute top-4 right-4 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

// Stylised "app window" illustration for the hero.
function HeroArt() {
  return (
    <div aria-hidden="true" className="flex justify-end max-md:hidden">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[14px] bg-white/95 shadow-2xl shadow-slate-950/50 [transform:perspective(900px)_rotateY(-10deg)_rotateX(4deg)]">
        <div className="flex gap-1.5 bg-slate-100 px-3 py-2.5">
          <i className="size-[9px] rounded-full bg-red-300" />
          <i className="size-[9px] rounded-full bg-amber-300" />
          <i className="size-[9px] rounded-full bg-green-300" />
        </div>
        <div className="flex h-[170px]">
          <div className="w-16 bg-gradient-to-b from-slate-800 to-slate-900" />
          <div className="flex flex-1 flex-col gap-2.5 p-3.5">
            <div className="h-2.5 w-3/5 rounded bg-indigo-200" />
            <div className="grid grid-cols-3 gap-2">
              <span className="h-9 rounded-lg bg-indigo-50" />
              <span className="h-9 rounded-lg bg-sky-50" />
              <span className="h-9 rounded-lg bg-emerald-50" />
            </div>
            <div className="h-2.5 w-[90%] rounded bg-slate-200" />
            <div className="h-2.5 w-3/4 rounded bg-slate-200" />
            <div className="h-2.5 w-2/5 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

const rowLink = 'group -mx-2 flex items-center gap-3.5 rounded-[10px] px-2 py-3 text-slate-700 no-underline transition-colors hover:bg-slate-50 hover:text-slate-700';

export default function Overview() {
  const { counts, apps } = useOverview();
  const empty = counts?.apps === 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative grid items-center gap-8 overflow-hidden rounded-[20px] bg-[radial-gradient(90%_120%_at_100%_0%,rgb(129_140_248/0.55),transparent_55%),radial-gradient(60%_90%_at_0%_100%,rgb(56_189_248/0.25),transparent_60%),linear-gradient(135deg,#1e1b4b_0%,#312e81_55%,#4338ca_100%)] px-10 py-9 text-indigo-100 shadow-2xl shadow-indigo-950/40 md:grid-cols-[1.2fr_1fr] max-md:px-6 max-md:py-7">
        <div>
          <span className="inline-block rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">Lowcode Studio</span>
          <h2 className="mt-2.5 mb-2 text-3xl leading-tight font-bold tracking-tight text-white max-md:text-2xl">
            {empty ? 'Build your first internal tool' : 'Welcome back'}
          </h2>
          <p className="m-0 max-w-[460px] text-[15px] leading-relaxed text-indigo-200">
            Assemble admin apps from pages, APIs and dictionaries — design visually, publish when ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link to="/admin/app/add" className={buttonClass('inverted', 'lg', 'font-semibold')}>
              <Plus size="1em" /> New app
            </Link>
            <Link to="/admin/apis/list" className={buttonClass('ghost', 'lg', 'bg-white/10 font-semibold text-indigo-100 ring-1 ring-white/20 hover:bg-white/15 hover:text-white')}>
              Manage APIs
            </Link>
          </div>
        </div>
        <HeroArt />
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 min-[85rem]:grid-cols-6">
        {stats.map((s) => <StatCard key={s.key} stat={s} value={counts ? counts[s.key] : undefined} />)}
      </section>

      <div className="grid items-start gap-6 min-[68.75rem]:grid-cols-[1.5fr_1fr]">
        <Card className="px-[22px] py-5">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-base font-semibold text-slate-900">Recent apps</h3>
            <Link to="/admin/app/list" className="flex items-center gap-1 text-[13px] font-medium text-indigo-600 no-underline hover:text-indigo-700">
              View all <ArrowRight size="1em" />
            </Link>
          </header>
          {apps === null ? (
            <SkeletonLines rows={4} className="py-2" />
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-start gap-3 pt-3 pb-1">
              <p className="m-0 text-slate-500">No apps yet.</p>
              <Link to="/admin/app/add" className={buttonClass('primary', 'md')}><Plus size="1em" /> Create an app</Link>
            </div>
          ) : (
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {apps.map((app) => (
                <li key={app.id}>
                  <Link to={`/admin/${encodeURIComponent(app.code)}/page/list`} className={rowLink}>
                    <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-400 to-indigo-600 font-bold text-white">
                      {String(app.name || app.code || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="truncate font-semibold text-slate-900">{app.name}</strong>
                      <code className="font-mono text-xs text-slate-500">{app.code}</code>
                    </span>
                    <StatusPill status={app.status} />
                    <ArrowRight size="1em" className="text-xs text-slate-300 group-hover:text-indigo-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="px-[22px] py-5">
          <h3 className="m-0 mb-3 text-base font-semibold text-slate-900">Getting started</h3>
          <ol className="m-0 list-none p-0">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Link to={step.href} className={cn(rowLink, 'items-start')}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[13px] font-bold text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    {i + 1}
                  </span>
                  <span>
                    <strong className="block font-semibold text-slate-900">{step.title}</strong>
                    <small className="mt-0.5 block text-[13px] text-slate-500">{step.text}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
