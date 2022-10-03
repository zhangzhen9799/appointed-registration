import { AppointmentRecord } from '../../database/model/AppointmentRecord'
import { fork } from 'child_process'
import path from 'path'
import os from 'os'

import { tmpLogin } from 'src/controllers/hos-monitor/appointedLogin'

interface msgType {
  addRecords?: AppointmentRecord[]
  delRecordList?: string[]
  [name: string]: any
}

const cpuNums = os.cpus().length

// 监听预约订单表
const watchChild = fork(path.join(__dirname, './watchAppointment.ts'), [], {
  execArgv: ['-r', 'ts-node/register']
})

const excuteChild = fork(path.join(__dirname, './excuteAppointment.ts'), [], {
  execArgv: ['-r', 'ts-node/register']
})

// 接收监听进程的消息
watchChild.addListener('message', (msg: msgType) => {
  if (typeof msg === 'object' && msg.msg !== undefined) {
    console.log('Message from child:', msg)
  }

  if (
    typeof msg === 'object' &&
    msg.addRecords !== undefined &&
    msg.addRecords.length > 0
  ) {
    // 通知执行进程增加预约记录
    excuteChild.send({ addRecords: msg.addRecords })
  }

  if (
    typeof msg === 'object' &&
    msg.delRecordList !== undefined &&
    msg.delRecordList.length > 0
  ) {
    // 通知执行进程减少预约记录
    excuteChild.send({ delRecords: msg.delRecordList })
  }
})

watchChild.addListener('exit', () => {})

excuteChild.addListener('message', (msg: msgType) => {
  if (typeof msg === 'object' && msg.needCookie === true) {
    tmpLogin().catch((err) => {
      throw new Error(err)
    })
  } else {
    console.log('Message from child:', msg)
  }
})
excuteChild.addListener('exit', () => {})
