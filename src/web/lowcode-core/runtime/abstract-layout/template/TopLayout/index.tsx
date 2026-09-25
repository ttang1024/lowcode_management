/**
 * @module TopLayout
 * @description Master page with the menu across the top.
 */
import React, { useContext } from 'react';
import { cn } from 'lowcode-kit';
import PageContent from '../../components/PageContent';
import MenuBar from '../../components/MenuBar';
import Logo from '../../components/Logo';
import Title from '../../components/Title';
import AppContext from '../../../app-context';

export const headerClass = (dark: boolean) => cn(
  'layout-header flex h-16 shrink-0 flex-nowrap items-stretch gap-1 overflow-x-auto pl-4',
  dark ? 'bg-slate-900 text-white' : 'border-b border-slate-100 bg-white text-slate-900 shadow-[0_1px_4px_0_rgba(0,21,41,0.12)]',
);

export default function TopLayout() {
  const appContext = useContext(AppContext);
  const dark = appContext.menuTheme !== 'light';
  return (
    <div className={`top-layout menu-theme-${appContext.menuTheme} flex h-screen flex-col`}>
      <header className={headerClass(dark)}>
        <Logo />
        <Title className="mr-5 ml-1 self-center text-base" />
        <MenuBar mode="horizontal" className="flex-1" />
      </header>
      <main className="layout-body min-h-0 flex-1 overflow-hidden">
        <PageContent />
      </main>
    </div>
  );
}
