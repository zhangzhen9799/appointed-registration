import { Request, Response } from 'express'

import Utils from 'src/utils'
import { tmpLogin } from 'src/controllers/hos-monitor/appointedLogin'
import {
  setAllHosListToSqlAsync,
  setAllDepartListToSqlAsync
} from 'src/controllers/hos-monitor/appointedSearch'
import { AppointmentRecord } from 'src/database/model/AppointmentRecord'
import { addAppointment, getAppoinmentList } from 'src/controllers/hos-monitor/appointment'
import { validateReqHeaderToken } from 'src/middleware/index'

import {
  getHosList,
  getDepListByHosCode
} from 'src/controllers/hos-monitor/getHosAndDepList'

import { OrmDataSource } from 'src/database/orm-data-source'
import { User } from 'src/database/model/User'
const UserReposity = OrmDataSource.getRepository(User)

@Utils.Controller('')
class Appointed {
  @Utils.Get('/tmp-login')
  @Utils.Use([validateReqHeaderToken])
  tmpLoginHandle(req: Request, res: Response): void {
    tmpLogin()
      .then((res: any) => {
        Utils.response(res, { data: true })
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  @Utils.Post('/updata-hos-list')
  @Utils.Use([validateReqHeaderToken])
  updataHosListHandle(req: Request, res: Response): void {}

  @Utils.Post('/updata-depart-list')
  @Utils.Use([validateReqHeaderToken])
  updataDepartListHandle(req: Request, res: Response): void {
    setAllDepartListToSqlAsync()
      .then((val) => {
        Utils.response(res, { data: true })
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  @Utils.Get('/get-hos-list')
  @Utils.Use([validateReqHeaderToken])
  getHosListHandle(req: Request, res: Response): void {
    const { name = '', levelText = '', pageSize = 1, pageNo = 20 } = req.query
    getHosList(
      { name: name as string, levelText: levelText as string },
      parseInt(pageNo as string),
      parseInt(pageSize as string)
    )
      .then((val) => {
        const [list, totalCount] = val
        Utils.response(
          res,
          {
            list,
            totalCount
          },
          200,
          'success'
        )
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  @Utils.Get('/get-depart-list')
  @Utils.Use([validateReqHeaderToken])
  getDepartListHandle(req: Request, res: Response): void {
    const { hoscode } = req.query
    getDepListByHosCode({ hoscode: hoscode as string })
      .then((val) => {
        Utils.response(res, val)
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  @Utils.Post('/add-appointment-record')
  @Utils.Use([validateReqHeaderToken])
  async addAppointmentRecord(req: Request, res: Response): Promise<void> {
    const {
      hoscode,
      firstcode,
      secondcode,
      starttime,
      endtime,
      interval,
      receiveemail
    } = req.body
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })

    // 创建预约单
    const appointmentRecord = new AppointmentRecord()
    appointmentRecord.userid = user?.userId as number
    appointmentRecord.hoscode = hoscode
    appointmentRecord.firstdepcode = firstcode
    appointmentRecord.seconddepcode = secondcode
    appointmentRecord.starttime = starttime
    appointmentRecord.endtime = endtime
    appointmentRecord.interval = interval
    appointmentRecord.receive_email = receiveemail
    // appointmentRecord.
    addAppointment(appointmentRecord)
      .then((val) => {
        Utils.response(res, { data: 'success' })
      })
      .catch((err) => {
        Utils.response(res, err)
      })
  }

  @Utils.Get('/get-appointment-list')
  @Utils.Use([validateReqHeaderToken])
  async getAppointmentListHandle(req: Request, res: Response): Promise<void> {
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })
    const userId = user?.userId
    if (userId !== undefined) {
      getAppoinmentList(userId.toString())
        .then((val) => {
          Utils.response(res, val)
        })
        .catch((err) => {
          Utils.response(res, err, 404, '查找预约列表失败')
        })
    } else {
      Utils.response(res, null, 404, '查找预约列表失败，未知错误')
    }
  }
}

export default Utils.classToRouter(Appointed)
