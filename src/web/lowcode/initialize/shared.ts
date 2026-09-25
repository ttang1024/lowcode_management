import './shared.runtime';
import * as lowcodeUI from 'lowcode-ui';
import type { MainApplicationExternal, WindowWithMainApplication } from 'lowcode-registry';

const runtime = window as WindowWithMainApplication;

runtime.MAINAPP = runtime.MAINAPP || {} as MainApplicationExternal;

runtime.MAINAPP.lowcodeUI = lowcodeUI;