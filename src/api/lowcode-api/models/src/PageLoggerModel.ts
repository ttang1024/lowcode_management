import { Table, Column, PrimaryKey, AutoIncrement, DataType, AllowNull } from 'sequelize-typescript';
import BaseModel from './BaseModel';

/** Dictionary */
@Table({ tableName: 'logger' })
export default class PageLoggerModel extends BaseModel<PageLoggerModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id: number;

  /** Operator */
  @Column({
    type: DataType.STRING(30),
    comment: 'Operator',
  })
    operator: string;

  /** Tag */
  @Column({
    type: DataType.STRING(30),
    comment: 'Tag',
  })
    tag: string;

  /** LogDescription */
  @AllowNull
  @Column({
    type: DataType.STRING,
    comment: 'LogDescription',
  })
    description: string;

  /** Log type */
  @Column({
    type: DataType.INTEGER,
    comment: 'Log type 1=version 0=update',
  })
    type: number;

  /** Related document */
  @AllowNull
  @Column({
    type: DataType.STRING,
    comment: 'Related document',
  })
    docUrl: string;

  /** Restore point */
  @AllowNull
  @Column({
    type: DataType.STRING,
    comment: 'Restore point',
  })
    revert: string;

  /** Page code */
  @Column({
    type: DataType.STRING(60),
    comment: 'Page code',
  })
    pageCode: string;
}