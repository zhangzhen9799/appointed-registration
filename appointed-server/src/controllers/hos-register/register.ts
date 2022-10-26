import { Response } from 'express'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import Utils from '../../utils'
import HttpProxyConfig from '../../utils/common/httpProxy'
import { OrmDataSource } from '../../database/orm-data-source'
import { AppointmentRecord } from '../../database/model/AppointmentRecord'
import { AppointmentSuccessRecord } from '../../database/model/AppointmentSuccessRecord'
import {
  getRequestHeadersByUserId,
  setRequestHeadersByUserId
} from '../../utils/common/requestHeader114'
import { getImageCode, getRegistrationDetails } from './updateCookie'

const AppointmentRecordReposity = OrmDataSource.getRepository(AppointmentRecord)
const AppointmentSuccessRecordReposity = OrmDataSource.getRepository(
  AppointmentSuccessRecord
)

interface RestDoctorsType {
  dutyCode: string
  dutyImgUrl: string
  detail: RestDoctorDetailType[]
  showIndexPosition: number
  showNumber: Boolean
  showPrice: Boolean
}
interface RestDoctorDetailType {
  uniqProductKey: string
  doctorName: string
  doctorTitleName: string
  skill: string
  period: any[]
  fcode: string
  ncode: string
  wnumber: number
  znumber: number
}

interface AppointedConfirmType {
  uniqProductKey: string
  hospitalName: string
  departmentName: string
  doctorName: string
  doctorTitleName: string
  skill: string
  visitTime: string
  totalFee: string
  serviceFee: string
  showFee: Boolean
  needRemoteHospitalCard: Boolean
  dataItem: {
    hospitalCardId: number
    hospitalCardIdTip: null
    jytCardId: number
    jytCardIdTip: null
    smsCode: number
    smsCodeTip: null
    contactUserInfo: number
  }
  commonRegisterNotice: null
  dutyImgUrl: string
  showRegRule: null
  takePlaceTips: string
}

interface AppointedOrderType {
  orderNo: string
  identifyingCode: string
  orderStatus: string
  orderStatusView: string
  orderType: string
  orderTime: null
  canCancel: Boolean
  cancelType: null
  cancelTime: null
  orderBaseInfo: {
    hosCode: string
    hosName: string
    deptCode: string
    deptName: string
    doctorName: string
    doctorTitle: string
    doctorSkill: string
    serviceFee: string
    visitTimeTips: string
    takeTimeTips: string
    takePlaceTips: string
    cancelTimeTips: string
    attention: null
    periodView: string
    dutyDate: string
    qrTipMessage: null
    qrCodeImg: null
  }
  patientInfo: {
    patientName: string
    patientIdType: null
    patientIdNo: null
    cardType: string
    cardTypeView: string
    cardNo: string
    medicareType: null
    medicareTypeView: null
  }
  payInfo: null
}

interface PatientInfoType {
  patientName: string
  idCardType: string
  idCardTypeView: string
  idCardNo: string
  idCardNoView: string
  phone: string
  status: string
  statusTips: string
  cardList: PatientInfoCardType[]
}

interface PatientInfoCardType {
  cardType: string
  cardTypeView: string
  cardNo: string
  cardNoView: string
  medicareType: string
  medicareTypeView: string
}

/**
 * @file-desc: 挂号，监控到有号之后调用挂号，开始挂号， 本文件中请求均需要挂代理进行操作
 * @author: huanghe
 */

/**
 * 获取某医院 某科室 某天的剩余号详情
 * 返回剩余号，如果返回数组为空，则表示已经无号
 */
const getHosAndDeptDetail = async (
  hosCode: string,
  firstDeptCode: string,
  secondDeptCode: string,
  target: string,
  userid: string
): Promise<RestDoctorsType[] | Boolean> => {
  console.log('getHosAndDeptDetail-userid==', userid)
  const headers = getRequestHeadersByUserId(userid)

  await getImageCode(headers)
  await getRegistrationDetails(
    hosCode,
    firstDeptCode,
    secondDeptCode,
    1,
    headers
  )
  const params = {
    hosCode,
    firstDeptCode,
    secondDeptCode,
    target
  }
  const res = await axios.post(
    `https://www.114yygh.com/web/product/detail?_time=${Date.now()}`,
    params,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  // console.log('getHosAndDeptDetail return data ====> ', res.data)
  if (res.data.resCode === 0) {
    // 将返回数据处理， 过滤出可以挂号号源
    const result = res.data.data.map((item: any) => {
      item.detail = item.detail.filter((v: any) => {
        if (v.wnumber % 2 === 0) {
          return false
        } else {
          return true
        }
      })
      return item
    })
    return result
  }
  // wnumber 为奇数表示还有余号 应用层面对剩余几个号不关注
  return false
}

/**
 * 判断用户是否实名
 */
const validateRealName = async (userid: string): Promise<Boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/user/real-name/status?_time=${Date.now()}`,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  // console.log('validateRealName==', res.data)
  if (res.data.resCode === 0) {
    // 实名认证通过   status === "AUTH_PASS" 表明实名认证通过
    if (res.data.data.status === 'AUTH_PASS') {
      setRequestHeadersByUserId(res.headers, userid)
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * 确认预约详情
 */

const appointedConfirm = async (
  hosCode: string,
  firstDeptCode: string,
  secondDeptCode: string,
  target: string,
  dutyTime: string,
  uniqProductKey: string,
  userid: string
): Promise<AppointedConfirmType | Boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  const params = {
    hosCode,
    firstDeptCode,
    secondDeptCode,
    target,
    dutyTime,
    uniqProductKey
  }
  const res = await axios.post(
    `https://www.114yygh.com/web/product/confirm?_time=${Date.now()}`,
    params,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  // console.log('appointedConfirm--->', res.data)
  if (res.data.resCode === 0) {
    // console.log(res.data.data)
    setRequestHeadersByUserId(res.headers, userid)
    return res.data.data
  }
  return false
}

/**
 * 获取就诊人信息  主要获取就诊人的卡
 * 接口前置，在用户登录过程中，就获取就诊人信息，提供用户选择，我们在库中保存即可
 * showType USER_CENTER 用户中心使用
 * showType ORDER_CONFIRM 预约使用
 */

export const getPatientInfoHandle = async (
  showType: 'USER_CENTER' | 'ORDER_CONFIRM',
  userid: string
): Promise<PatientInfoType[]> => {
  // console.log('userid==', userid)
  const headers = getRequestHeadersByUserId(userid)
  // console.log('headers.Cookie==', headers.Cookie)
  // console.log('showType==', showType)
  const res = await axios.get(
    `https://www.114yygh.com/web/patient/list?_time=${Date.now()}&showType=${showType}`,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  console.log('getPatientInfoHandle', res.data)
  if (res.data.resCode === 0) {
    setRequestHeadersByUserId(res.headers, userid)
    return res.data.data.list
  } else {
    return []
  }
}

/**
 * 就诊人授权 然后修改cookie
 * https://www.114yygh.com/web/hospital/authority?_time=1665327795848&hosCode=H02110003
 */

const setAuthority = async (hosCode: string, userid: string): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/hospital/authority?_time=${Date.now()}&hosCode=${hosCode}`,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  // console.log('setAuthority--->', res.data)
  if (res.data.resCode === 0) {
    setRequestHeadersByUserId(res.headers, userid)
    return res.data.data
  }
}

/**
 * 提交挂号申请
 */

const saveAppointment = async (
  cardNo: string,
  cardType: string,
  hosCode: string,
  firstDeptCode: string,
  secondDeptCode: string,
  dutyTime: string,
  uniqProductKey: string,
  orderFrom: string,
  phone: string,
  treatmentDay: string,
  smsCode: string,
  userid: string
): Promise<String | Boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  const params = {
    cardNo,
    cardType,
    hosCode,
    firstDeptCode,
    secondDeptCode,
    dutyTime,
    uniqProductKey,
    orderFrom,
    phone,
    treatmentDay,
    smsCode
  }
  const res = await axios.post(
    `https://www.114yygh.com/web/order/save?_time=${Date.now()}`,
    params,
    {
      headers,
      ...HttpProxyConfig
    }
  )
  console.log('saveAppointment', res.data)
  if (res.data.resCode === 0) {
    // console.log(res.data.data)
    // res.data.data.orderNo  订单号
    // 挂号成功
    const orderNo = res.data.data.orderNo
    return orderNo
  }
  return false
}

/**
 * 查看预约订单详情
 */

const getAppointmentOrderDetail = async (
  hosCode: string,
  orderNo: string,
  userid: string
): Promise<AppointedOrderType | boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/order/detail?_time=${Date.now()}&hosCode=${hosCode}&orderNo=${orderNo}`,
    {
      headers,
      ...HttpProxyConfig
    }
  )

  if (res.data.resCode === 0) {
    // console.log(res.data)
    return res.data.data
    // 订单详情 res.data.data
  }
  return false
  // 如果预约成功需要在数据库中记录
  // 发送邮件到个人 并抄送谷歌邮箱
}

/**
 * 获取预约单
 */

const getAppointmentRecord = (
  appointmentid: string
): Promise<AppointmentRecord | null> => {
  return AppointmentRecordReposity.createQueryBuilder('appointment')
    .where('appointment.appointmentid = :appointmentid', { appointmentid })
    .getOne()
}

/**
 * 预约成功之后将预约成功记录入库
 */
const saveAppointmentSuccessRegister = async (
  appointmentSuccessRecord: Partial<AppointmentRecord>
): Promise<void> => {
  await AppointmentRecordReposity.createQueryBuilder()
    .insert()
    .into(AppointmentSuccessRecord)
    .values([appointmentSuccessRecord])
    .execute()
}

/**
 *
 * 对用户个体，我们页面上提供输入短信验证码登录入口（页面只需要输入手机号即可，代码执行图片验证码认证机制，然后通过重试轮询检测用户提交的短信验证码）
 * 验证成功之后我们给用户操作登录，并将此用户的请求头信息 进行保存
 * 当用户预约单监控成功之后（检测到有符合条件的医院-科室 以及号的类型 普通号 和 专家号），启动挂号流程
 * 挂号流程：
 *  1. 使用用户自己的cookie 信息进行执行上面接口
 *  2. 其中任何一步出现用户登录状态失败的情况，可以通过短信或者邮箱提醒用户来平台重新登录个人的114账号
 *  3. 挂号接口出现失败，通知用户重新创建一个新的预约单
 *  4. 查询预约成功，我们通过短信和邮箱通知用户，已经挂号成功
 *  5. 尝试破解iconfont to number 之间的关系 获取预约的价格
 *  6. 返回值中的serviceFee 也表示价格
 *  7. 或者在前端页面上加上是否排除专家号 还是只预约专家号 后端通过正则进行判断
 *  8. 前端页面加上用户选择什么卡挂号 身份证或者是社保卡
 */

const register = async (
  hosCode: string,
  firstDeptCode: string,
  secondDeptCode: string,
  target: string,
  filterCallback: (restDoctorItem: RestDoctorsType) => RestDoctorsType[],
  appointmentid: string,
  userid: string
): Promise<void> => {
  const restDoctors = await getHosAndDeptDetail(
    hosCode,
    firstDeptCode,
    secondDeptCode,
    target,
    userid
  )
  console.log('restDoctors====', restDoctors)
  // 有余号的医生
  if (Array.isArray(restDoctors) && restDoctors.length > 0) {
    // 根据条件选中一个医生
    const { uniqProductKey, period } = [
      ...restDoctors.filter(filterCallback)[0].detail,
      ...restDoctors.filter(filterCallback)[1].detail
    ][0]
    const validateRealNameResult = await validateRealName(userid)
    let dutyTime = '0'
    if (Array.isArray(period) && period.length > 0) {
      dutyTime = period[0].dutyTime
    }
    // 验证用户实名成功
    if (validateRealNameResult === true) {
      const appointedConfirmRes = await appointedConfirm(
        hosCode,
        firstDeptCode,
        secondDeptCode,
        target,
        dutyTime,
        uniqProductKey,
        userid
      )
      console.log(
        'appointedConfirmRes---->',
        typeof appointedConfirmRes === 'object'
      )
      if (typeof appointedConfirmRes === 'object') {
        // 此时需要预约的详情已有 可以提醒用户正在挂号
        await setAuthority(hosCode, userid)
        // 查库获取用户选择的挂号证件
        const appointmentInfo = await getAppointmentRecord(appointmentid)
        if (appointmentInfo !== null) {
          // console.log('appointmentInfo====', appointmentInfo)
          const cardNo = appointmentInfo.patient_card
          const cardType = appointmentInfo.patient_card_type
          const phone = appointmentInfo.patient_phone
          const email = appointmentInfo.receive_email

          const saveAppointmentRes = await saveAppointment(
            cardNo,
            cardType,
            hosCode,
            firstDeptCode,
            secondDeptCode,
            dutyTime,
            uniqProductKey,
            'HOSP',
            phone,
            target,
            '',
            userid
          )
          if (
            typeof saveAppointmentRes === 'string' &&
            saveAppointmentRes !== ''
          ) {
            const appointmentOrderDetail = await getAppointmentOrderDetail(
              hosCode,
              saveAppointmentRes,
              userid
            )
            if (typeof appointmentOrderDetail !== 'boolean') {
              // 预约成功，发送邮件给用户 提醒用户预约抢号成功
              // 并提醒用户
              // 并祝福用户健康每一天
              await Utils.sendEmail({
                to: email,
                text: '您在平台设定的挂号订单已经预约成功，请到114官方平台查看详情'
              })
              const appointSuccessRecord = new AppointmentSuccessRecord()
              appointSuccessRecord.userid = userid
              appointSuccessRecord.appointmentid = appointmentid
              appointSuccessRecord.doctor_name =
                appointmentOrderDetail.orderBaseInfo.doctorName
              appointSuccessRecord.doctor_title =
                appointmentOrderDetail.orderBaseInfo.doctorTitle
              appointSuccessRecord.patient_name =
                appointmentOrderDetail.patientInfo.patientName
              appointSuccessRecord.visit_time =
                appointmentOrderDetail.orderBaseInfo.visitTimeTips
              appointSuccessRecord.hos_name =
                appointmentOrderDetail.orderBaseInfo.hosName
              appointSuccessRecord.dep_name =
                appointmentOrderDetail.orderBaseInfo.deptName
              appointSuccessRecord.service_fee =
                appointmentOrderDetail.orderBaseInfo.serviceFee
              appointSuccessRecord.patientPhone = phone
              appointSuccessRecord.patientCardNo = cardNo
              appointSuccessRecord.patientCardType = cardType
              appointSuccessRecord.receive_email = email
              appointSuccessRecord.order_number = appointmentOrderDetail.orderNo
              await saveAppointmentSuccessRegister(appointSuccessRecord)
            }
          } else {
            // 邮件通知 服务繁忙，请稍候重试
            await Utils.sendEmail({
              to: email,
              text: '服务繁忙，请稍候重试, 您可以尝试在平台重新登录您的114账号'
            })
          }
        }
      }
    } else {
      console.log(chalk.red('未实名...'))
    }
  }
}

// const hosCode = 'H112628'
// const firstDeptCode = 'Medical_system'
// const secondDeptCode = '0000168'
// const target = '2022-10-13'
// const dutyTime = '0'
// const callback = (item: any): any => item
// const appointmentid = 'ffca1b8a-4983-41cb-9f83-f2262e8d9c3d'
// const userid = '71f416d7-0860-4053-9da0-ab425e136e65'

// register(
//   hosCode,
//   firstDeptCode,
//   secondDeptCode,
//   target,
//   dutyTime,
//   callback,
//   appointmentid,
//   userid
// ).catch((err) => {
//   throw new Error(err)
// })

export default {
  register
}
