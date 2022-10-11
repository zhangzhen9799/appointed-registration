import { Request, Response } from 'express'

import Utils from 'src/utils'
import {
  tmpLogin,
  userLoginSendMsg,
  userLoginPhone
} from 'src/controllers/hos-monitor/appointedLogin'
import {
  setAllHosListToSqlAsync,
  setAllDepartListToSqlAsync
} from 'src/controllers/hos-monitor/appointedSearch'
import { AppointmentRecord } from 'src/database/model/AppointmentRecord'
import {
  addAppointment,
  getAppoinmentList
} from 'src/controllers/hos-monitor/appointment'
import { validateReqHeaderToken } from 'src/middleware/index'

import {
  getHosList,
  getDepListByHosCode
} from 'src/controllers/hos-monitor/getHosAndDepList'

import { getPatientInfoHandle } from 'src/controllers/hos-register/register'

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
      receiveemail,
      patientPhone,
      patientCardNo,
      patientCardType
    } = req.body
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })

    // 创建预约单
    const appointmentRecord = new AppointmentRecord()
    if (user?.userId !== undefined) {
      appointmentRecord.userid = user?.userId
      appointmentRecord.hoscode = hoscode
      appointmentRecord.firstdepcode = firstcode
      appointmentRecord.seconddepcode = secondcode
      appointmentRecord.starttime = starttime
      appointmentRecord.endtime = endtime
      appointmentRecord.interval = interval
      appointmentRecord.receive_email = receiveemail
      appointmentRecord.patientPhone = patientPhone
      appointmentRecord.patientCardNo = patientCardNo
      appointmentRecord.patientCardType = patientCardType
    }

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

  @Utils.Post('/user-phone-send-msg')
  @Utils.Use([validateReqHeaderToken])
  async userLoginSendMsg(req: Request, res: Response): Promise<void> {
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })
    const userId = user?.userId
    const { phone } = req.body
    if (userId !== undefined) {
      userLoginSendMsg(phone as string, userId)
        .then((val) => {
          Utils.response(res, {
            success: true,
            msg: '发送成功，请稍候查看手机短信验证码'
          })
        })
        .catch((err) => {
          Utils.response(res, err, 404, '发送验证码失败，请稍候重试')
        })
    } else {
      Utils.response(res, null, 404, '发送验证码失败，请稍候重试')
    }
  }

  @Utils.Post('/user-phone-login')
  @Utils.Use([validateReqHeaderToken])
  async userPhoneLogin(req: Request, res: Response): Promise<void> {
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })
    const userId = user?.userId
    const { phone, code } = req.body
    if (userId !== undefined) {
      userLoginPhone(phone as string, code, userId)
        .then((val) => {
          Utils.response(res, {
            success: true,
            msg: '114平台登录成功'
          })
        })
        .catch((err) => {
          Utils.response(res, err, 404, '114平台登录失败，请稍候重试')
        })
    } else {
      Utils.response(res, null, 404, '114平台登录失败，请稍候重试')
    }
  }

  @Utils.Post('/user-get-patient-info')
  @Utils.Use([validateReqHeaderToken])
  async getPatientInfo(req: Request, res: Response): Promise<void> {
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    const user = await UserReposity.findOneBy({
      email
    })
    const userId = user?.userId
    if (userId !== undefined) {
      getPatientInfoHandle(userId)
        .then((val) => {
          Utils.response(
            res,
            {
              data: val
            },
            200,
            '查找就诊人信息成功'
          )
        })
        .catch((err) => {
          Utils.response(res, err, 404, '查找就诊人信息失败')
        })
    } else {
      Utils.response(res, null, 404, '查找就诊人信息失败')
    }
  }
}

export default Utils.classToRouter(Appointed)
