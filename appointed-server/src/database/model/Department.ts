import {
  Entity,
  Column,
  PrimaryColumn,
  Generated,
  TreeParent,
  TreeChildren,
  Tree
} from 'typeorm'

@Entity()
@Tree("nested-set")
export class Department {
  @Generated('uuid')
  @PrimaryColumn()
  departid: string

  @Column()
  name: string

  @PrimaryColumn()
  code: string

  @Column()
  hoscode: string

  @Column()
  level: number

  @TreeParent()
  parent: Department

  @TreeChildren()
  children: Department[]

  initDepartment(item: Department): Department {
    this.name = item.name
    this.code = item.code
    this.hoscode = item.hoscode
    this.level = item.level
    this.parent = item.parent
    this.children = item.children
    return this
  }
}
