export const COLUMN_FIXED = [
  { label: 'None', value: '' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

export const TABLE_SIZE = [
  { label: 'Default', value: 'default' },
  { label: 'Center', value: 'middle' },
  { label: 'Small', value: 'small' },
];

// API request method
export const API_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'OPTIONS', value: 'OPTIONS' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'HEAD', value: 'HEAD' },
];

// Content type
export const CONTENT_TYPE = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
];

// API return value type
export const RESPONSE_TYPE = [
  { label: 'json', value: 'json' },
  { label: 'arrayBuffer', value: 'arrayBuffer' },
  { label: 'text', value: 'text' },
];

// Event type
export const BUTTON_EVENT_TYPES = [
  { label: 'View', value: 'action' },
  { label: 'API', value: 'api' },
  { label: 'Link', value: 'link' },
  { label: 'None', value: 'none' },
];

// View type
export const ACTION_UI = [
  { label: 'Inline', value: 'object' },
  { label: 'Dialog', value: 'popup' },
  { label: 'Drawer', value: 'drawer' },
];

// Form group style
export const FORM_GROUP_STYLE = [
  { label: 'Default', value: 'normal' },
  { label: 'Card', value: 'gap' },
  { label: 'Tabs', value: 'tabs' },
];

// Tab style
export const TABS_STYLE = [
  { label: 'Line', value: 'line' },
  { label: 'Card', value: 'card' },
];

// Tab bar position
export const TABS_POSITION = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

// Table refresh type
export const REFRESH_MODE = [
  { label: 'Page visible', value: 'visible' },
  { label: 'Interval', value: 'timeout' },
  { label: 'Page visible and interval', value: 'both' },
];

const routeCompletions = [
  { value: 'route', meta: 'Route data' },
];

export const COMPLETIONS = {
  buttonCompletions: [
    ...routeCompletions,
  ],
  actionCompletions: [
    ...routeCompletions,
    { value: 'props.action', meta: 'Action name' },
    { value: 'props.subAction', meta: 'Sub-action name' },
    { value: 'props.record', meta: 'Action data' },
    { value: 'props.subAction', meta: 'Sub-action data' },
  ],
};

export const LINK_TARGET = [
  { label: 'Default', value: '_self' },
  { label: 'New window', value: '_blank' },
];
