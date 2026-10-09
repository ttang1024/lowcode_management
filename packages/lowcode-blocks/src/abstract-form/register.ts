/**
 * @module abstract-form/register
 * @description
 *   Value-converter registry for the form input factory. Converters translate
 *   between a field's stored value and the value its editor component expects.
 */
import type { ValueConverter } from '../interface';

export type { ValueConverter };

class Registry {
  private converters = new Map<string, ValueConverter>();

  register(converter: ValueConverter): this;
  register(name: string, converter: ValueConverter): this;
  register(a: string | ValueConverter, b?: ValueConverter): this {
    const converter: ValueConverter = typeof a === 'string' ? { name: a, ...b } : a;
    const key = converter.name as string;
    if (key) this.converters.set(key, converter);
    return this;
  }

  get(name: string): ValueConverter | undefined {
    return this.converters.get(name);
  }
}

/** Singleton converter registry. */
export const ConverterRegistry = new Registry();
