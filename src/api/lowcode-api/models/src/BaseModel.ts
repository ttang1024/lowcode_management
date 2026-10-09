import { Column, Model, DataType, Default, AllowNull } from 'sequelize-typescript';
import config from '../../config';

/**
 * App and page codes become URL segments and published file paths
 * (appdata/lowcode/webapps/<app>/pages/<page>.json), so they are limited to
 * characters that are safe in both. Must stay in sync with CODE in framework/resources.ts.
 */
export const CODE_PATTERN = /^(?!\.)[A-Za-z0-9_.-]+$/;
export const CODE_MESSAGE = 'Codes may only contain letters, digits, "_", "-" and "." (not first)';

export default class BaseModel<T extends {} = any> extends Model<T> {
  /** Environment identifier */
  @Default(config.ENV)
  @AllowNull(false)
  @Column({
    type: DataType.STRING(20),
    comment: 'Environment identifier',
    get() {
      return this.getDataValue('env' as any);
    },
    set() {
      this.setDataValue('env' as any, config.ENV);
    },
  })
    env!: string;
}