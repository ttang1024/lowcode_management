import { Table, Column, PrimaryKey, AutoIncrement, Length, AllowNull, DataType, Is } from 'sequelize-typescript';
import BaseModel, { CODE_MESSAGE, CODE_PATTERN } from './BaseModel';

export enum PageStatus {
  INIT = 0,
  ONLINE = 1,
  OFFLINE = 2
}

/** App system page */
@Table({
  tableName: 'app_page',
  indexes: [
    // A page code is unique within its app; duplicates fail as a UniqueConstraintError.
    { name: 'code_aid_index', fields: ['code', 'appCode'], unique: true },
  ],
})
export default class AppPageModel extends BaseModel<AppPageModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number;

  /** Page name */
  @Length({ max: 20, msg: 'Page name cannot exceed 20 characters' })
  @AllowNull(false)
  @Column({
    type: DataType.STRING(32),
    comment: 'Page name',
  })
    name!: string;

  /** Page code,used for routing */
  @Length({ max: 32, msg: 'Page code cannot exceed 32 characters' })
  @Is({ args: CODE_PATTERN, msg: CODE_MESSAGE })
  @AllowNull(false)
  @Column({
    type: DataType.STRING(32),
    comment: 'Page code',
  })
    code!: string;

  /** PageDescription */
  @Column({
    type: DataType.STRING(100),
    comment: 'PageDescription',
  })
    desc!: string;

  /** Code of the app the page belongs to */
  @AllowNull(false)
  @Column({
    type: DataType.STRING(36),
  })
    appCode!: string;

  /** Page status */
  @Column({
    type: DataType.INTEGER,
    comment: 'Page status 0=init 1=online 2=offline',
  })
    status!: number;

  /** Page icon */
  @Column({
    type: DataType.STRING(30),
    comment: 'Page icon, usable as a menu icon',
  })
    icon!: string;

  /** Page type */
  @Column({
    type: DataType.INTEGER,
    comment: 'Page type 1: design page 2: iframe-embedded page 3:',
  })
    pageType!: number;

  /** Page config */
  @Column({
    type: DataType.STRING(512),
    comment: 'Page config; when pageType is iframe this value is the iframe url',
  })
    pageOption!: string;
}