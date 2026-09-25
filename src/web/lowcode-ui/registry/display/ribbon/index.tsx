import { Ribbon, type RibbonProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = RibbonProps

export default component.runtime('ribbon', { type: 'display' })(Ribbon);
