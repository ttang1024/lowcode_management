/**
 * @module config
 * @description Global runtime configuration singleton (file gateway / OSS, etc.).
 */
export interface FileGatewayConfig {
  data?: Record<string, any>;
  uploadUrl?: string;
  /** Base URL files are served from. */
  url?: string;
}

export interface CommonConfig {
  fileGateway?: FileGatewayConfig;
  [key: string]: any;
}

const state: CommonConfig = {};

const Config = {
  /** Merge application configuration (called once at bootstrap). */
  setup(config: CommonConfig) {
    Object.assign(state, config);
    return Config;
  },

  /** Read the current configuration. */
  get(): CommonConfig {
    return state;
  },

  get fileGateway(): FileGatewayConfig {
    return state.fileGateway || {};
  },
};

export default Config;
