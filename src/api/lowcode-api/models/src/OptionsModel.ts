import { Table, Column, PrimaryKey, AutoIncrement, Length, DataType, AllowNull, Unique } from 'sequelize-typescript';
import BaseModel from './BaseModel';

/** Dictionary */
@Table({ tableName: 'options' })
export default class OptionsModel extends BaseModel<OptionsModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
    id: number;

  /** Dictionary code */
  @Length({ max: 30, msg: 'Code length cannot exceed30' })
  @Unique({ name: 'name_index', msg: 'Dictionary code cannot be duplicated' })
  @AllowNull
  @Column({
    type: DataType.STRING(30),
    comment: 'Dictionary code',
  })
    code: string;

  /** Dictionary name */
  @Length({ max: 100, msg: 'Dictionary name cannot exceed 22 characters' })
  @AllowNull
  @Column({
    type: DataType.STRING(100),
    comment: 'Dictionary name',
  })
    name: string;

  /** Dictionary value type */
  @Column({
    type: DataType.INTEGER,
    comment: 'Dictionary value type 1=json 0=options',
  })
    type: number;

  /** Value for the dictionary key */
  @Column(DataType.TEXT)
  get value(): OptionItemValue[] {
    try {
      return JSON.parse(this.getDataValue('value' as any));
    } catch (ex) {
      return [];
    }
  }

  set value(value: string | OptionItemValue[]) {
    if (typeof value == 'string') {
      this.setDataValue('value' as any, value);
    } else {
      this.setDataValue('value' as any, JSON.stringify(value));
    }
  }
}