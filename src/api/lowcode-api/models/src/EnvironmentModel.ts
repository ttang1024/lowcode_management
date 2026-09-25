import { Table, Column, PrimaryKey, AutoIncrement, Length, AllowNull, DataType, Default, Unique } from 'sequelize-typescript';
import BaseModel from './BaseModel';

/** Environment variable table */
@Table({
  tableName: 'env_variables',
  createdAt: 'create_at',
  updatedAt: 'update_at',
})
export default class EnvironmentModel extends BaseModel<EnvironmentModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id: number;

  /** Variable name */
  @Unique({ name: 'uidx_name_unique_index', msg: 'Duplicate variable name' })
  @Length({ max: 100, msg: 'Variable name length exceeds the limit' })
  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
    comment: 'Variable name',
  })
    name: string;

  /** Variable value */
  @Length({ max: 500, msg: 'Variable value length exceeds the limit' })
  @AllowNull(false)
  @Column({
    field: 'data_value',
    type: DataType.STRING(500),
    comment: 'Variable value',
  })
    value: string;

  /** Description */
  @Length({ max: 100, msg: 'VariableDescriptionexceeds the limit' })
  @AllowNull(true)
  @Column({
    field: 'description',
    type: DataType.STRING(100),
    comment: 'Description',
  })
    desc: string;

  /** Whether enabled */
  @Default('1')
  @Column({
    field: 'validity',
    type: DataType.TINYINT,
    comment: 'Whether enabled; default 1, 0=disabled 1=enabled',
  })
    enable: string;
}