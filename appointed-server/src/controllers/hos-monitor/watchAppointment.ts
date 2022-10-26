// 子进程不要使用alias 这种路径
import schedule from 'node-schedule'
import { OrmDataSource } from '../../database/orm-data-source'
import { AppointmentRecord } from '../../database/model/AppointmentRecord'
import { Brackets } from 'typeorm'

interface ObjType {
  [name: string]: any
}

interface msgType {
  addRecords?: AppointmentRecord[]
  delRecordList?: string[]
  [name: string]: any
}

// 开启子进程查数据库，如果有符合条件的预约单则进行消费
let oldObjTree: ObjType = {}
export const watchAppointmentList = async (): Promise<any> => {
  // 查询订单时间范围有效 状态设置为2 标识开始监控
  await OrmDataSource.createQueryBuilder()
    .update(AppointmentRecord)
    .set({ state: 2 })
    .where('state = :state', { state: 1 })
    .andWhere(':datenow BETWEEN starttime and endtime', {
      datenow: new Date()
    })
    .execute()
  // TODO: 前期均为测试账号，测试账号10分钟自动结束
  // await OrmDataSource.createQueryBuilder()
  //   .update(AppointmentRecord)
  //   .set({ state: 3 })
  //   .where('state = :state', { state: 2 })
  //   .andWhere(
  //     new Brackets((qb) => {
  //       qb.where(':datenow > endtime', {
  //         datenow: new Date()
  //       }).orWhere(':outtime > starttime', {
  //         outtime: new Date(Date.now() - 1000 * 60 * 5)
  //       })
  //     })
  //   )
  //   .execute()
  const list = await OrmDataSource.getRepository(AppointmentRecord)
    .createQueryBuilder('appoint')
    .where('appoint.state = :state', { state: 2 })
    .andWhere(':datenow BETWEEN appoint.starttime and appoint.endtime', {
      datenow: new Date()
    })
    .getMany()
  const newObjTree: ObjType = {}

  // 需要删除项
  const delRecordList: string[] = []
  // 新增项
  const addRecordList: AppointmentRecord[] = []

  if (list !== null) {
    list.forEach((item) => {
      newObjTree[item.appointmentid] = item
    })

    // 对返回结果进行分类
    // 需要新增
    // 需要删除
    const oldKeys = Object.keys(oldObjTree)
    const newKeys = Object.keys(newObjTree)
    const allKeys: string[] = ([] as string[]).concat(oldKeys).concat(newKeys)
    allKeys.forEach((item: string) => {
      if (newObjTree[item] !== undefined && oldObjTree[item] === undefined) {
        // 新树中有 旧树没有
        addRecordList.push(newObjTree[item])
      } else if (
        newObjTree[item] === undefined &&
        oldObjTree[item] !== undefined
      ) {
        // 旧树有 新树没有
        delRecordList.push(item)
      }
    })
    if (addRecordList.length > 0) {
      addAppointmentRecord(addRecordList)
    }
    if (delRecordList.length > 0) {
      delAppointmentRecord(delRecordList)
    }
    // 更新旧树
    oldObjTree = Object.assign({}, newObjTree)
  }
}

const addAppointmentRecord = (records: AppointmentRecord[]): void => {
  if (process.send !== undefined) {
    process.send({ addRecords: records })
  }
}

const delAppointmentRecord = (delRecordList: string[]): void => {
  if (process.send !== undefined) {
    process.send({ delRecordList })
  }
}

if (process.send !== undefined) {
  process.send({ msg: '扫描预约单 子进程启动' })
  process.on('message', (msg: msgType) => {
    if (typeof msg === 'object' && msg.msg !== undefined) {
      console.log('Message from parent:', msg)
    }
  })

  OrmDataSource.initialize()
    .then(() => {
      const job = schedule.scheduleJob('*/1 * * * * *', async () => {
        await watchAppointmentList()
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
}
