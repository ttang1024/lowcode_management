export interface AppBaseOptions {
  // Whether the host must load React (not needed when the host already runs React 19) (default: false)
  loadReact: boolean, //
  // whether the project useshashroute (Default value: false)
  isHashRouter: boolean
  // Whether to render the master-page content; not shown by default
  layout?: boolean
  // to be passed tolowcodeAppReactthe component parameters
  props?: Record<string, any>
  // currentlowcodeenvironment
  env: 'dev' | 'test' | 'pre' | 'prod' | 'debug'
}

export interface ApplicationInstance {
  /**
   * Refresh the current instance
   */
  refresh: () => void

  /**
   * Destroy the current instance
   */
  destory: () => void
}

export interface AppOptions extends AppBaseOptions {
  // the target root element for the current app to render into
  root: HTMLElement
}

export interface AppComponentOptions extends AppBaseOptions {
  // the current componentReactobject
  React: typeof import('react')
}

/**
 * Run the lowcode sub-system into the target element
 * @param options
 */
export type createApplication = (options: AppOptions) => ApplicationInstance

/**
  * Create a React client component that renders a lowcode sub-system
  * @param options
  */
export type createComponent = (options: AppComponentOptions) => import('react').FC

export type RunApplicationFn = (options: Omit<AppOptions, 'loadReact' | 'env'>) => ApplicationInstance