import { Entity, Column, PrimaryColumn, Generated } from 'typeorm'

@Entity()
export class AppointmentRecord {
  @Generated('uuid')
  @PrimaryColumn()
  appointmentid: string

  @Column()
  userid: string

  @Column()
  hoscode: string

  @Column()
  firstdepcode: string

  @Column()
  seconddepcode: string

  @Column({
    default: 1,
    comment: '1: 等待监控 2: 监控中 3: 监控结束 4: 已经取消'
  })
  state: number

  @Column()
  interval: number

  @Column()
  receive_email: string

  @Column()
  starttime: Date

  @Column()
  endtime: Date
}
