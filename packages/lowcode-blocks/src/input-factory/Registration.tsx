/**
 * @module input-factory/Registration
 * @description
 *   Generic registry of named registrations (input editors, components, rulers,
 *   converters, ...). Consumers either instantiate it directly
 *   (`new Registrations<T>()`) or subclass it (`class X extends Registrations<T>`)
 *   and look entries up by `type` / `name`.
 */
import type { RegistrationBase } from '../interface';

export type { RegistrationBase };

export class Registrations<T extends RegistrationBase = RegistrationBase> {
  protected items = new Map<string, T>();

  /** Register one or many entries, keyed by `type` (falling back to `name`). */
  register(registration: T | T[]): this {
    const list = Array.isArray(registration) ? registration : [registration];
    for (const item of list) {
      const key = (item.type || item.name) as string;
      if (key) this.items.set(key, item);
    }
    return this;
  }

  /** Look up a single registration by its `type` / `name` key. */
  getRegistration(name: string): T | undefined {
    return this.items.get(name);
  }

  /** All registered entries. */
  getAllRegistrations(): T[] {
    return Array.from(this.items.values());
  }
}
