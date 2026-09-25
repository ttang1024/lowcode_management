import React from 'react';


type InjectRouter = (root: HTMLElement, options: Record<string, any>) => (() => void);

export interface RegistryContextValue {
  // Sub-app name, e.g.: gy-workorder
  name: string
  // App code registered in the Member Center; if empty, defaults based onnameconvert
  appId?: string
  // whether currently the design admin
  isAdmin?: boolean
  // whether the current sub-app ishashroute Default value: true
  isHashRouter?: boolean
  // Whether to render the master-page content
  layout?: boolean
  // currentDebug of Bundle
  debugPackage?: string
  // currently rendered at the same level asabstract-pagethe same-level content
  extendRouter?: React.ReactElement | React.ReactNode
  // rendered by insertionabstract-pagesame-level route content
  injectRouter?: () => InjectRouter
  // whether currently in sub-app debug mode
  isDebug?: boolean
  // whether in sub-app design mode
  isChildDesign?: boolean
  // Whether designing forms inside a sub-app
  design?: boolean
}

export const RegistryContext = React.createContext<RegistryContextValue>({} as RegistryContextValue);
