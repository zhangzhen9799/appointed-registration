import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'

import { OrmDataSource } from 'src/database/orm-data-source'
import { AppointmentRecord } from 'src/database/model/AppointmentRecord'
import { User } from 'src/database/model/User'
import { Hospital } from 'src/database/model/Hospital'
import { Department } from 'src/database/model/Department'

const AppointmentRecordReposity = OrmDataSource.getRepository(AppointmentRecord)
const Manager = OrmDataSource.manager
/**
 * TODO:
 * 1. 创建预约单
 * 2. 查看预约单 (+取消预约)
 * 3. 消费预约单
 */

const getHeaders = (): any => {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../constants/114Cookie.json'),
      'utf-8'
    )
  )
}

// 创建预约单
export const addAppointment = (
  appointmentRecord: Partial<AppointmentRecord>
): Promise<any> => {
  return AppointmentRecordReposity.createQueryBuilder()
    .insert()
    .into(AppointmentRecord)
    .values([appointmentRecord])
    .execute()
}

// 查看预约单列表
export const getAppoinmentList = (userid: string): Promise<any> => {
  return AppointmentRecordReposity.createQueryBuilder('appointment')
    .leftJoinAndSelect(User, 'user', 'user.userId = appointment.userid')
    .leftJoinAndSelect(Hospital, 'hos', 'hos.code = appointment.hoscode')
    .leftJoinAndSelect(
      Department,
      'dep',
      'dep.code = appointment.seconddepcode'
    )
    .where('appointment.userid = :userid', { userid })
    .select(
      `appointment.userid as userid,
        appointment.appointmentid as id,
        appointment.hoscode as hoscode,
        appointment.firstdepcode as firstdepcode,
        appointment.seconddepcode as seconddepcode,
        appointment.receive_email as receive_email,
        appointment.starttime as starttime,
        appointment.endtime as endtime,
        appointment.interval as inter_time,
        hos.name as hosname,
        dep.name as second_depname,
        appointment.state as state`
    )
    .getRawMany()
}
