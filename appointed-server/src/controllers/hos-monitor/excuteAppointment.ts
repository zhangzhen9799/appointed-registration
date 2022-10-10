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

const emitParentGetCookieHandle = _.debounce(
  () => {
    console.log(chalk.green('已经通知父进程更新114平台cookie'))
    if (process.send !== undefined) {
      process.send({ needCookie: true })
    }
  },
  300000,
  { leading: true }
)

const getHeaders = (): any => {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../constants/114Cookie.json'),
      'utf-8'
    )
  )
}

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

const getRegistrationDetails = (
  firstDeptCode: string,
  secondDeptCode: string,
  hosCode: string,
  week: number
): Promise<any> => {
  const headers = getHeaders()
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
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
      // console.log(JSON.stringify(res.data))
      if (res.data.resCode === 102 && res.data.data === null) {
        // 给主进程发消息，获取新cookie
        // TODO: 等下删掉注释
        emitParentGetCookieHandle()
      } else if (res.data.data !== null) {
        fs.writeFile(
          path.join(__dirname, '../../logs/Logs114/searchRecord.log'),
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
        return res.data.data.calendars
      } else {
        console.log('res.data', res.data)
      }
    })
    .catch(async (err) => {
      console.log('er===>', err)
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
  const resultList = []
  const resultListFirstWeek = await getRegistrationDetails(
    params.firstdepcode,
    params.seconddepcode,
    params.hoscode,
    1
  )
  const resultListSecondWeek = await getRegistrationDetails(
    params.firstdepcode,
    params.seconddepcode,
    params.hoscode,
    2
  )
  if (Array.isArray(resultListFirstWeek)) {
    resultList.push(...resultListFirstWeek)
  }
  if (Array.isArray(resultListSecondWeek)) {
    resultList.push(...resultListSecondWeek)
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
      await sendEmail({
        to: params.receive_email,
        subject: '114监控平台',
        text: '监控平台提醒您，您预约的{医院}-{科室}-{时间段}，现在有号可约，抓紧时间来预约挂号吧！！！'
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
      })
    }
  })
  .catch((err) => {
    throw new Error(err)
  })
