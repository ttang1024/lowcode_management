import { Column, Model, DataType, Default, AllowNull } from 'sequelize-typescript';
import config from '../../config';

export default class BaseModel<T> extends Model<T> {
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
    env: string;
}