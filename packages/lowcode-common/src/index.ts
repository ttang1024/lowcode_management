/**
 * lowcode-common (local open-source shim)
 *
 * Drop-in replacement for the private `lowcode-common` package: a browser HTTP
 * client (Network/Service), OSS/URL helpers and rematch helper types.
 */
export { Network, Service, BizError, RequestBuilder } from './network';
export type { NetworkConfig, NetworkEvent, RequestContext } from './network';

export { default as Config } from './config';
export type { CommonConfig, FileGatewayConfig } from './config';

export { default as Oss } from './oss';
export type { UploadOptions, UploadResult, UploadProgress } from './oss';

export { default as Url, isAbsoluteUrl, joinUrl } from './url';
export type { ParsedUrl } from './url';

export { default as useQuery, useQueryHook } from './network/useQuery';
export type { HooksResponse, QueryStatus } from './network/useQuery';

export { useHistory, useRouteMatch } from './router';
export type { CompatHistory, CompatMatch } from './router';

export type { RematchEffectThis, RematchModelTo } from './types';
