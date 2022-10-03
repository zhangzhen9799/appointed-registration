import { Entity, Column, PrimaryColumn, Generated } from 'typeorm'

@Entity()
export class Hospital {
  @Generated('uuid')
  @PrimaryColumn()
  hosid: string

  @Column()
  name: string

  @PrimaryColumn()
  code: string

  @Column({
    default: null
  })
  distance: string

  @Column()
  levelText: string

  @Column({
    default: null
  })
  maintain: boolean

  @Column({
    default: null
  })
  openTimeText: string

  @Column({
    default: null
  })
  picture: string
}

export interface HospitalType {
  hosid?: string
  distance?: string
  hosname: string
  hoscode: string
  levelText: string
  maintain: boolean
  openTimeText: string
  picture: string
}
