import { Table, Column, PrimaryKey, AutoIncrement, Length, DataType, Unique } from 'sequelize-typescript';
import BaseModel from './BaseModel';

/** API */
@Table({
  tableName: 'apis',
})
export default class ApisModel extends BaseModel<ApisModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number;

  /** API system */
  @Length({ max: 30, msg: 'API system length cannot exceed 30' })
  @Column({
    type: DataType.STRING(30),
    comment: 'System the API belongs to',
  })
    system!: string;

  /** API description */
  @Length({ max: 30, msg: 'API description length cannot exceed30' })
  @Unique({ name: 'name_index', msg: 'API name cannot be duplicated' })
  @Column({
    type: DataType.STRING(30),
    comment: 'API description',
  })
    name!: string;

  /** RequestType */
  @Column({
    type: DataType.STRING(8),
    comment: 'Request method GET POST',
  })
    method!: string;

  /** API URL */
  @Length({ max: 255, msg: 'API URL cannot exceed 255 characters' })
  @Column({
    type: DataType.STRING,
    comment: 'API URL',
  })
    path!: string;

  /** Whether to send cookies */
  @Column({
    type: DataType.INTEGER,
    comment: 'Whether to send cookies',
  })
    credentials!: boolean;

  /** Content type */
  @Column({
    type: DataType.STRING(50),
    comment: 'Content type',
  })
    contentType!: string;

  /** Return type */
  @Column({
    type: DataType.STRING(20),
    comment: 'Return type',
  })
    responseType!: string;

  /** params */
  @Column({
    type: DataType.STRING,
    comment: 'Parameter list',
  })
  get params(): ApiParams {
    try {
      return JSON.parse(this.getDataValue('params' as any));
    } catch (ex) {
      return {};
    }
  }

  set params(value: ApiParams) {
    this.setDataValue('params' as any, JSON.stringify(value));
  }
}