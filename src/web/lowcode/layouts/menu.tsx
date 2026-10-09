import React from 'react';
import { BookOpen, Gauge, LayoutGrid, Plug, SlidersHorizontal, SquareFunction } from 'lucide-react';

export interface NavItem {
  key: string;
  title: string;
  /** One-line description shown under the page title. */
  description: string;
  icon: React.ReactNode;
  href: string;
  /** Pathnames that belong to this entry (drives selection + breadcrumb). */
  match: RegExp;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      {
        key: 'overview',
        title: 'Overview',
        description: 'A snapshot of everything in this workspace.',
        icon: <Gauge size="1em" />,
        href: '/admin/overview',
        match: /^\/admin\/overview/,
      },
      {
        key: 'apps',
        title: 'Apps',
        description: 'Create apps, manage their pages and publish them.',
        icon: <LayoutGrid size="1em" />,
        href: '/admin/app/list',
        // `/admin/app/...` plus each app's pages at `/admin/:app/page/...`
        match: /^\/admin\/(app(\/|$)|[^/]+\/page(\/|$))/,
      },
    ],
  },
  {
    title: 'Data & logic',
    items: [
      {
        key: 'options',
        title: 'Dictionaries',
        description: 'Option lists that power selects, tags and enums.',
        icon: <BookOpen size="1em" />,
        href: '/admin/options/list',
        match: /^\/admin\/options/,
      },
      {
        key: 'apis',
        title: 'APIs',
        description: 'Backend endpoints that pages can call, with mocks.',
        icon: <Plug size="1em" />,
        href: '/admin/apis/list',
        match: /^\/admin\/apis/,
      },
      {
        key: 'functions',
        title: 'Functions',
        description: 'Reusable validators and formatters for page logic.',
        icon: <SquareFunction size="1em" />,
        href: '/admin/functions/list',
        match: /^\/admin\/functions/,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        key: 'env',
        title: 'Config variables',
        description: 'Variables resolved at runtime by published apps.',
        icon: <SlidersHorizontal size="1em" />,
        href: '/admin/env/list',
        match: /^\/admin\/env/,
      },
    ],
  },
];

const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => item.match.test(pathname));
}
