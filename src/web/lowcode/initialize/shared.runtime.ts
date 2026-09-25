import * as lowcodeCore from 'lowcode-core';
import * as lowcodeRegistry from 'lowcode-registry';
import { AbstractForm } from 'lowcode-blocks';
import lowcodeConfigs from 'lowcode-configs';
import { Network, Service } from 'lowcode-common';
import * as lowcodeKit from 'lowcode-kit';

const runtime = window as lowcodeRegistry.WindowWithMainApplication;

const lowcodeCommon = { Network, Service };

runtime.MAINAPP = {
  lowcodeKit,
  lowcodeConfig: lowcodeConfigs,
  lowcodeCore: lowcodeCore,
  lowcodeRegistry: lowcodeRegistry,
  lowcodeCommon,
  lowcodeUI: {
    AbstractForm,
  },
};