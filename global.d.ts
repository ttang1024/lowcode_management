declare module '@loadable/component' {
  export default function loadable(task: () => Promise<any>): React.ComponentType | React.ComponentType<any> | undefined;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare type OmitModel<T> = Omit<T, keyof Omit<import('sequelize-typescript').Model, 'id' | 'createdAt' | 'updatedAt'>>

interface ApiResponse<T> {
  callId?: string,
  success: boolean
  result: T
  errorCode?: number
  errorMsg?: string
}

interface OptionItemValue {
  label: string
  value: string
}

interface AppMenu {
  name: string
  menuNo: string
  url: string
  icon: string
  customKey: string
  subs: AppMenu[]
  btns: any
}

type ComponentCss = React.CSSProperties & {
  fn: string, // (model: Record<string, any>) => React.CSSProperties
}

interface TableSearchModel {
  // Title
  title: string
  // Property name
  name: string
  // Whether to enable auto search
  auto?: boolean
  // Column span
  span?: number
  // Item title width
  labelWidth?: number
  // Wrap display
  break?: boolean
  // Description text
  extra?: string | React.ReactNode | React.ReactElement
  // Control type
  component?: ComponentModel
  // Whether the control is disabled
  disabled?: boolean
  // Control default value
  initialValue?: string
  // Linkage function
  cascade?: string
  // Value converter
  convert?: {
    name: string
    options: string
  }
  // Component style
  componentCss?: ComponentCss
  // Prompt text
  placeholder?: string
  // Default value object
  initialValueObj?: SearchDefaultOptions
}

interface TableColumnModel {
  // Column property name
  name: string
  // Column name
  title: string
  // Whether the field is sortable
  sortable?: boolean
  // Sort field name
  sort?: string
  // Column built-in formatter
  formatter?: ComponentModel
  // Column tooltip config
  fixed?: string
  // Column width
  width?: number
  // Style of the current formatting select component
  componentCss?: ComponentCss
  // Whether to ellipsis when exceeding the width
  ellipsis?: boolean
  // Value property name used by the component
  valueName?: string
}

interface TableButtonModel {
  // Button title
  title: string,
  // Whether confirmation is required
  needConfirm?: boolean
  // Whether to show a confirmation prompt if confirmation is needed can be set as follows: confirm:'Are you sure you want to delete?'
  confirm?: string,
  // controls whether this button is visible
  visible?: string
  /**
   *  and enablethe difference is, enblableReturnfalsehides the button, disabled Returntruedisables the button
   */
  disabled?: string
  // Button tooltip text
  tip?: string,
  target?: 'cell' | 'top'
  // Selection mode
  select?: import('lowcode-blocks/src/abstract-table/types').AbstractButton<any>['select']
  // Button icon
  icon?: string
  // Danger button
  danger?: boolean
  // Ghost mode
  ghost?: boolean
  // Button shape
  shape?: 'default' | 'circle' | 'round'
  // Button size
  size?: 'small' | 'middle' | 'large'
  // Button shape
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | ''
  // Event type
  event?: EventConfigurerModel
  // Button enabled-state control function
  avariable?: string
  // Button color
  backgroundColor?: string
  // Button text color
  color?: string
}

interface FormButtonModel extends Omit<TableButtonModel, 'select' | 'target'> {
  // Whether to enable validation
  needValidate?: boolean
  // Button position
  target: 'top' | 'footer'
}

interface PageApiParamAndResponseFormat {
  requestFormatFunction?: string
  responseFormatFunction?: string
}

interface ApiConfigurerModel {
  meta: {
    name: string
    params?: ApiParams
  },
  silent?: boolean
  values: PageApiParamAndResponseFormat
  loading?: boolean
  mock?: boolean
  shared?: boolean
  pullMode?: 'async-call' | 'async-result' | ''
  // Async API poll count
  pullCount: number
  // Async API poll interval
  pullDelay: number
}

interface AppConfigurerModel extends OmitModel<import('lowcode-api/models').AppModel> {
  name: string;
  // Appearance settings true is light, false is dark
  theme?: boolean;
  // Layout mode
  layout?: 'side' | 'top' | 'mix';
  // Theme color
  primaryColor?: string;
  menuOptions?: {
    // Whether the menu is collapsible
    collapsible: boolean
    // Whether the menu is collapsed by default
    defaultCollapsed: boolean
    // Menu width
    width: number
    // Dark menu
    theme: string
    // Menu width when collapsed
    collpasedWidth: number
    miniIcon: boolean
  }
}

interface TableSearchButton {
  icon?: string
  title?: string
  visible?: boolean
  shape?: string
  size?: string
}

interface PageInnerView {
  event: EventConfigurerModel
}

interface PageConfigurerModel extends Partial<OmitModel<import('lowcode-api/models').AppPageModel>> {
  version?: number

  // Protocol version
  protocolVersion: number

  idKey: string

  // Configured table column info
  columns: TableColumnModel[]

  // Configured search field info
  searchFields: TableSearchModel[]

  // Configured categorytab
  filter?: import('lowcode-blocks/src/interface').AbstractFilters

  // Configured action buttons
  buttons: TableButtonModel[]

  // List-page query API config
  queryApi?: ApiConfigurerModel

  // List refresh type
  refresh?: 'timeout' | 'visible' | 'both' | ''

  // Refresh interval Unit:seconds
  refreshTimeout: number

  // Whether to keep the page number on refresh
  refreshKeepPage: boolean

  // View list
  views?: ViewConfigurerModel[]

  // Search layout config
  searchOptions?: {
    isNewLine: boolean
    buttonFlow: 'center' | 'left' | 'right'
    // Whether to enable search on Enter
    enterKeySubmit?: boolean
    // Search itemsstyle
    searchLineGap?: number
    // Query button text
    btnQuery: TableSearchButton
    // Clear button text
    btnCancel?: TableSearchButton
    // Search form title width
    searchLabelWidth?: number
    // Set how many search criteria per row
    span?: number
    // Default number of search criteria shown
    defaultCount?: number
  }

  // Whether it comes from cache
  fromCache?: boolean

  // Table config
  tableOptions?: import('lowcode-blocks/src/abstract-table/types').AbstractTableProps<any>

  // Page style
  pageCss: string

  // Extra page control config properties
  options?: {
    // Whether to hide the header
    hideHeader?: boolean
  }
}


interface ViewConfigurerModel {
  // Viewid
  id: string
  // Group style
  groupStyle?: string
  // Number of forms per row
  cols?: number
  // Form title item width
  labelWidth?: number
  // Whether it is a form
  groups: FormItemModel[]
  // View button
  buttons: FormButtonModel[]
  // Group style
  // if the group style istabsits correspondingtabsType
  tabType?: 'line' | 'card'
  // if the group style istabsits correspondingtabsPosition
  tabPosition?: 'top' | 'left' | 'bottom' | 'right'
  // Submit button config
  btnSubmit?: ButtonConfigModel
  // Cancel button config
  btnCancel?: ButtonConfigModel
  // View type
  type?: 'view' | 'sub-view'
  // Row spacing
  lineGap?: number
  // Container width
  width?: number
  // View height
  height?: string | number
}

interface FormItemGroupModel {
  // Group name
  group?: string
  // Group icon
  groupIcon?: string
  // Form items per row in a grouped form
  cols?: number
  // Title width for forms within a group
  labelWidth?: number
  // Group visibility function
  visible?: string
  // Whether the current group is read-only
  readonly?: string
  // Row spacing
  lineGap?: number
}

interface FormItemModel extends Omit<FormItemGroupModel, 'visible'> {
  // Title
  title: string
  // Property name
  name: string
  // Column span
  span?: number
  // Form offset
  offset?: number
  // Whether to start a new row
  break?: boolean
  // Description text
  extra?: string | React.ReactNode | React.ReactElement
  // Description text function
  extraFn?: string
  // Input placeholder description
  placeholder?: string
  // Component config
  component?: ComponentModel
  // Whether the control is disabled
  disabled?: boolean
  // Control default value
  initialValue?: string
  // Field visibility control function
  avariable?: string
  /**
   * Form value converter
   */
  convert?: {
    name: string
    options: any
  }
  // Whether to display in non-control mode
  textonly?: boolean
  // Whether to show input feedback
  hasFeedback?: boolean
  // Linked data change: when the current form data changes, other form data can be updated
  cascade?: string
  // Whether the title wraps
  titleBreak?: boolean

  // Validation rules
  rules?: FormItemRuleModel[]

  // Whether to show a colon
  colon?: boolean

  // Control style
  componentCss?: ComponentCss

  // Title style
  titleCss?: ComponentCss

}

interface DragOptions {
  isDragging: boolean
  item: {
    index: number
  }
  [x: string]: any
}

interface DropOptions {
  isOver: boolean
  canDrop: boolean
  handlerId: import('dnd-core').Identifier | null
  [x: string]: any
}

declare type ReloadType = 'table' | 'page' | 'none' | 'sub-page'

declare type ReloadTypes = ReloadType[]

interface EventConfigurerModel {
  type: 'api' | 'action' | 'link' | 'none'
  api?: ApiConfigurerModel
  action?: ActionConfigurerModel
  // Navigation target
  target?: string
  href?: string
  // Whether to go back one level
  back?: boolean
  // Prompt shown after a successful API call
  apiMessage?: string
  // Whether to refresh the table after a successful API call
  reloadType?: ReloadTypes
  // Whether to close the current page after submitting
  closeOnSubmit?: boolean
  // Suppress the success message
  noApiMessage?: boolean
}

/** Stored button settings (mapped to kit props by `fromButtonConfig` in lowcode-kit). */
interface ButtonConfigModel {
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | ''
  danger?: boolean
  size?: 'small' | 'middle' | 'large'
  shape?: 'default' | 'circle' | 'round'
  ghost?: boolean
  children?: any
  disabled?: boolean
  [key: string]: any
}

interface ActionOptionsModel {
  title: string
  width: number
  height: number
  fixedFooter: boolean
  btnSubmit?: ButtonConfigModel
  btnCancel?: ButtonConfigModel
}

interface ActionConfigurerModel {
  options: ActionOptionsModel
  view: string
  name: string
  title: string
  pageTitle: string
  subTitle: string
  type: 'object' | 'popup' | 'drawer'
  noRoute?: boolean
  viewConfig?: ViewConfigurerModel
  api?: ApiConfigurerModel
  submitApi?: ApiConfigurerModel
  // API success prompt
  successMessage?: string
  // Whether to refresh the table
  reloadType?: ReloadTypes
  // Whether to close the page after saving
  closeOnSubmit?: boolean
  // Whether the current view is read-only
  isReadOnly: boolean
  // Whether it is dynamicviewView
  isDynamic?: boolean
  onCancel?: () => void
  // Callback invoked after the action is submitted
  onPostSubmit?: (model: any, response: any) => void
  // Whether to skip detection; not configuredsubmitApi
  ignoreSubmitApiCheck?: boolean
  // no promptmessage
  noMessage?: boolean
}

interface ComponentModel extends Omit<import('lowcode-registry/src/component/index').ComponentCreation, ''> {
  fnOptions?: string
}

interface ComponentCreationReason {
  type: string
  item: any
}

interface JsxParameter {
  name: string
  value: string
}

interface FormItemRuleModel {
  name: string
  options: string
  message: string
}

interface ButtonAvariableInfo {
  visible: boolean
  disabled: boolean
}

interface ApiMetaModel {
  name: string
  id: number
  contentType: string
  headers?: OptionItemValue[]
  method: string
  path: string
  system: string
  responseType: string
}

interface ClipboardDesignModel<T = any> {
  // Copy source environment
  from: 'dev' | 'test' | 'pre' | 'prod'
  // Copy data type
  type: 'page' | 'search' | 'form' | 'column' | 'button'
  // Copied data
  data: T
  // Identifier
  name: 'lowcode'
}

interface ApiWrapperOptions {
  type: 'options' | 'api' | 'json' | 'none'
  optionsKey: string
  api: ApiConfigurerModel
  json: Array<{ label: string, value: string }>
}

interface PagePublishModel {
  tag: string
  description: string
  docUrl: string
  backup: boolean
}

interface SearchDefaultOptions {
  type: 'constant' | 'route' | 'none';
  constant?: string;
  route?: string;
  isArray?: boolean
}

interface EnvironmentVariables {
  [x: string]: string
}

interface EnvOption {
  label: string
  value: string
}

declare namespace React {

  type Booleanish = boolean | 'true' | 'false';

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // React-specific Attributes
    defaultChecked?: boolean | undefined;
    defaultValue?: string | number | ReadonlyArray<string> | undefined;
    suppressContentEditableWarning?: boolean | undefined;
    suppressHydrationWarning?: boolean | undefined;

    // Standard HTML Attributes
    accessKey?: string | undefined;
    className?: string | undefined;
    contentEditable?: Booleanish | 'inherit' | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: Booleanish | undefined;
    hidden?: boolean | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    placeholder?: string | undefined;
    slot?: string | undefined;
    spellCheck?: Booleanish | undefined;
    style?: CSSProperties | undefined;
    tabIndex?: number | undefined;
    title?: string | undefined;
    translate?: 'yes' | 'no' | undefined;

    // Unknown
    radioGroup?: string | undefined; // <command>, <menuitem>

    // WAI-ARIA
    role?: AriaRole | undefined;

    // RDFa Attributes
    about?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    resource?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;

    // Non-standard Attributes
    autoCapitalize?: string | undefined;
    autoCorrect?: string | undefined;
    autoSave?: string | undefined;
    color?: string | undefined;
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
    results?: number | undefined;
    security?: string | undefined;
    unselectable?: 'on' | 'off' | undefined;

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | undefined;

    rev?: string
  }
}