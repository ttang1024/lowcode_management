import { Table, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';
import BaseModel from './BaseModel';

/** API */
@Table({ tableName: 'functions' })
export default class FunctionsModel extends BaseModel<FunctionsModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number;

  /** Type */
  @Column({
    type: DataType.STRING(50),
    comment: 'Type',
  })
    type!: string;

  /** Purpose */
  @Column({
    type: DataType.STRING(50),
    comment: 'Purpose',
  })
    usage!: string;

  /** Code snippet */
  @Column({
    type: DataType.STRING(500),
    comment: 'Snippet',
  })
    snippet!: string;
}