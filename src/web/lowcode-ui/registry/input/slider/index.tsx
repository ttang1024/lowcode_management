import { Slider, type SliderProps } from 'lowcode-kit';
import { component } from 'lowcode-registry';

export type RuntimeProps = SliderProps

export default component.runtime('slider', { type: 'input', valueType: 'number|[number,number]' })(Slider);
