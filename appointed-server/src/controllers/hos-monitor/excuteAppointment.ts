import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import _ from 'lodash'

import { setCookie } from '../../utils/Cookie'
import { sendEmail } from '../../utils/common/sendEmail163'
import { OrmDataSource } from '../../database/orm-data-source'
import { AppointmentRecord } from '../../database/model/AppointmentRecord'
import HttpProxyConfig from '../../utils/common/httpProxy'
import userRegister from '../hos-register/register'
import { getRequestHeadersByUserId } from '../../utils/common/requestHeader114'
import { getImageCode } from '../hos-register/updateCookie'
import { Hospital } from '../../database/model/Hospital'
import { Department } from '../../database/model/Department'

const AppointmentRecordReposity = OrmDataSource.getRepository(AppointmentRecord)

interface msgType {
  addRecords?: AppointmentRecord[]
  delRecordList?: string[]
  [name: string]: any
}
interface TaskInsType {
  [name: string]: {
    timer: any
  }
}

let isBlockMonitor: Boolean = false

const emitParentGetCookieHandle = _.debounce(
  () => {
    // console.log(chalk.green('已经通知父进程更新114平台cookie'))
    // if (process.send !== undefined) {
    //   process.send({ needCookie: true })
    //   isBlockMonitor = true
    // }
    console.log(chalk.green('114登录状态失效，请检查'))
  },
  300000,
  { leading: true }
)

class SearchTaskManager {
  public taskIns: TaskInsType = {}
  addRecords(appointRecords: AppointmentRecord[]): void {
    appointRecords.forEach((record) => {
      const appointmentId = record.appointmentid
      const interval = record.interval
      this.taskIns[appointmentId] = {
        timer: setInterval(() => {
          excuteAppointment(record).catch(() => {})
        }, interval)
      }
    })
  }

  removeRecords(ids: string[]): void {
    changeAppointmentState(ids).catch((err) => {
      throw new Error(err)
    })
    ids.forEach((id) => {
      clearInterval(this.taskIns[id].timer)
      this.taskIns[id].timer = null
    })
  }
}

const searchTM = new SearchTaskManager()

const getRegistrationDetails = async (
  firstDeptCode: string,
  secondDeptCode: string,
  hosCode: string,
  week: number,
  phone: string,
  userid: string
): Promise<any> => {
  const headers = getRequestHeadersByUserId(userid)
  await getImageCode(headers)
  return axios
    .post(
      `https://www.114yygh.com/web/product/list?_time=${Date.now()}`,
      {
        firstDeptCode,
        secondDeptCode,
        hosCode,
        week
      },
      {
        headers,
        ...HttpProxyConfig
      }
    )
    .then((res: any): any => {
      // console.log('getRegistrationDetails - res', res)
      if (res.data.resCode === 102 && res.data.data === null) {
        // 给主进程发消息，获取新cookie
        // TODO: 等下删掉注释
        emitParentGetCookieHandle()
      } else if (res.data.data !== null) {
        setCookie(res.headers['set-cookie'], headers)
        fs.writeFile(
          path.join(__dirname, `../../logs/Logs114/${phone}.log`),
          JSON.stringify(res.data.data, null, ' '),
          {
            encoding: 'utf-8',
            flag: 'a+'
          },
          (err) => {
            if (err !== null) {
              console.log('写入失败', err)
            }
          }
        )
        return {
          calendars: res.data.data.calendars,
          totalWeek: res.data.data.totalWeek
        }
      } else {
        // console.log('res.data', res.data)
        console.log('操作频繁，返回数据异常...')
      }
    })
    .catch(async (err) => {
      // console.log('er===>', err)
      throw new Error(err)
    })
    .finally(() => {
      // updateProxy()
    })
}
// 消费预约单 （开启子进程刷接口，对有存量的进行发邮件
// 取消 之后关闭子进程
// 发送邮件后关闭子进程
export const excuteAppointment = async (
  params: AppointmentRecord
): Promise<void> => {
  // 请求指定平台，是否已经具有可用cookie
  // 如果cookie 不可用，需要尝试重新登录
  // cookie 不可用，则 isBlockMonitor 为true 然后 直接return
  if (isBlockMonitor === true) {
    return
  }
  const resultList = []
  const { totalWeek, calendars: resultListFirstWeek } =
    await getRegistrationDetails(
      params.firstdepcode,
      params.seconddepcode,
      params.hoscode,
      1,
      params.patient_phone,
      params.userid
    )
  const resultRestWeek = []
  // 将剩余的全部加载回来
  for (let i = 2; i <= totalWeek; i++) {
    resultRestWeek.push(
      getRegistrationDetails(
        params.firstdepcode,
        params.seconddepcode,
        params.hoscode,
        i,
        params.patient_phone,
        params.userid
      )
    )
  }
  const resultListRestWeek = (await Promise.all(resultRestWeek)).reduce(
    (acc, cur) => acc.push(cur.calendars),
    []
  )
  if (Array.isArray(resultListFirstWeek)) {
    resultList.push(...resultListFirstWeek)
  }
  if (Array.isArray(resultListRestWeek)) {
    resultList.push(...resultListRestWeek)
  }
  // 每一项中的status为 "AVAILABLE" 表示当天还有号
  const userSetStartTime = new Date(params.starttime).getTime()
  const userSetEndTime = new Date(params.endtime).getTime()
  const restList = resultList.filter((item: any) => {
    const dutyDateTime = new Date(item.dutyDate).getTime()
    return (
      dutyDateTime >= userSetStartTime &&
      dutyDateTime <= userSetEndTime &&
      item.status === 'AVAILABLE'
    )
  })
  if (restList.length > 0) {
    if (searchTM.taskIns[params.appointmentid].timer !== null) {
      console.log(chalk.green('监控平台提醒您，当前订单检测有号可以预约'))
      // 把监控的定时器清除
      searchTM.removeRecords([params.appointmentid])
      // 连表查询医院和科室名称
      const recordInfo = await AppointmentRecordReposity.createQueryBuilder(
        'appointment'
      )
        .leftJoinAndSelect(Hospital, 'hos', 'hos.code = appointment.hoscode')
        .leftJoinAndSelect(
          Department,
          'dep',
          'dep.code = appointment.seconddepcode'
        )
        .select(
          `appointment.appointmentid as id,
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
        .getRawOne()
      await sendEmail({
        to: params.receive_email,
        subject: '114监控平台',
        text: `监控平台提醒您，您预约的${recordInfo.hosname}-${recordInfo.second_depname}-${params.starttime}-${params.endtime}，现在有号可约，抓紧时间来预约挂号吧！！！`
      })

      await userRegister.register(
        params.hoscode,
        params.firstdepcode,
        params.seconddepcode,
        restList[0].dutyDate,
        '0',
        (item: any) => item,
        params.appointmentid,
        params.userid
      )
    }
  }
}

// 发送邮件之后，将状态切换为3 表示监控结束
export const changeAppointmentState = async (
  appointIds: string[]
): Promise<void> => {
  await OrmDataSource.createQueryBuilder()
    .update(AppointmentRecord)
    .set({ state: 3 })
    .where('state = :state', { state: 2 })
    .andWhere('appointmentid in (:...ids)', { ids: appointIds })
    .execute()
}

OrmDataSource.initialize()
  .then(() => {
    if (process.send !== undefined) {
      process.send({ msg: '执行消费预约单子进程启动' })

      process.on('message', (msg: msgType) => {
        if (typeof msg === 'object' && msg.msg !== undefined) {
          console.log('Message from parent:', msg)
        }
        if (
          typeof msg === 'object' &&
          msg.addRecords !== undefined &&
          msg.addRecords.length > 0
        ) {
          // 增加预约单
          console.log('增加预约单', msg.addRecords)
          searchTM.addRecords(msg.addRecords)
        }

        if (
          typeof msg === 'object' &&
          msg.delRecords !== undefined &&
          msg.delRecords.length > 0
        ) {
          // 减少预约单
          console.log('减少预约单', msg.delRecords)
          searchTM.removeRecords(msg.delRecords)
        }
        if (typeof msg === 'object' && msg.updated114Cookie === true) {
          isBlockMonitor = false
        }
      })
    }
  })
  .catch((err) => {
    throw new Error(err)
  })
