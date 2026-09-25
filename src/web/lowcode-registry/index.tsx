import ruler from './src/ruler';
import converter, { DATE_TIME_FORMAT } from './src/converter';
import component from './src/component';
import type { ComponentRegistration } from './src/component';
import { AbstractForm } from './src/dependency';
import type { AbstractGroups, AbstractRules } from './src/dependency';
import hot from './src/hot';
import ApplicationRunner, { registerApplication } from './src/runner/index';
import { RegistryContext } from './src/runner/context';
import type { RegistryContextValue } from './src/runner/context';
import AppContext from './src/app-context';
import { usePageRoute } from './src/route';

export interface WindowWithMainApplication {
  MAINAPP?: MainApplicationExternal
}

export type MainApplicationExternal = {
  lowcodeKit: any
  lowcodeUI: any
  lowcodeCore: any
  lowcodeRegistry: any
  lowcodeConfig: any
  lowcodeCommon: any
}

const config = ((window as WindowWithMainApplication)?.MAINAPP?.lowcodeConfig) as {
  API: string
  FILEGW: string
  // File server URL
  CDN: string
  /** @deprecated Use CDN. */
  CDN_PUBLIC: string
  // Main domain URL
  DOMAIN: string
};

export {
  hot,
  ruler,
  converter,
  component,
  AbstractForm,
  RegistryContext,
  registerApplication,
  ApplicationRunner,
  config,
  AppContext,
  usePageRoute,
  DATE_TIME_FORMAT,
};

export type {
  ComponentRegistration,
  AbstractGroups,
  AbstractRules,
  RegistryContextValue,
};