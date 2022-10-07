import { Entity, Column, PrimaryColumn, Generated } from 'typeorm'

@Entity()
export class AppointmentSuccessRecord {
  @Generated('uuid')
  @PrimaryColumn()
  id: string

  @Column()
  appointmentid: string

  @Column()
  patient_name: string

  @Column()
  visit_time: string

  @Column()
  hos_name: string

  @Column()
  dep_name: string

  @Column()
  doctor_title: string

  @Column()
  doctor_name: string

  @Column()
  service_fee: string

  @Column()
  phone: string

  @Column()
  order_number: string
}
