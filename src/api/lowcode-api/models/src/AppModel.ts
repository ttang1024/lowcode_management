import { Table, Column, PrimaryKey, AutoIncrement, Length, Unique, AllowNull, DataType } from 'sequelize-typescript';
import BaseModel from './BaseModel';

export enum AppStatus {
  INIT = 0,
  ONLINE = 1,
  OFFLINE = 2
}

/** App system */
@Table({ tableName: 'app' })
export default class AppModel extends BaseModel<AppModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id: number;

  /** System display name */
  @Length({ max: 30, msg: 'App name cannot exceed 20 characters' })
  @AllowNull(false)
  @Column({
    type: DataType.STRING(30),
    comment: 'System display name',
  })
    name: string;

  /** System code,used for routing */
  @Unique({ name: 'code_unique_index', msg: 'Duplicate app code' })
  @AllowNull(false)
  @Length({ max: 32, msg: 'App code length cannot exceed 32 characters' })
  @Column({
    type: DataType.STRING(32),
    comment: 'System code',
  })
    code: string;

  /** System Logo */
  @Column({
    type: DataType.STRING,
    comment: 'System Logo',
  })
    logo: string;

  /** SystemDescription */
  @Column({
    type: DataType.STRING,
    comment: 'SystemDescription',
  })
    desc: string;

  /** Icon library URL */
  @Column({
    type: DataType.STRING,
    comment: 'Icon library URL',
  })
    iconUrl: string;

  /** Home page URL */
  @Column({
    type: DataType.STRING(255),
    comment: 'System home page',
  })
    home: string;

  /** System owner */
  @Column({
    type: DataType.STRING(32),
    comment: 'System owner',
  })
    owner: string;

  /** App status  0:init 1:online 2:offline */
  @Column({
    type: DataType.INTEGER,
    comment: 'App status  0=init 1=online 2=offline',
  })
    status: AppStatus;

  /** Referenced bundle */
  @Column({
    type: DataType.STRING(1024),
    comment: 'Referenced bundle',
  })
  get packages(): string[] {
    try {
      return JSON.parse(this.getDataValue('packages' as any));
    } catch (ex) {
      return [] as string[];
    }
  }

  set packages(value: string[]) {
    this.setDataValue('packages' as any, JSON.stringify(value));
  }
}