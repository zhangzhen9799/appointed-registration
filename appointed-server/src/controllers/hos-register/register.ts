import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import Utils from 'src/utils'
import { ReqHeadersType } from 'src/types/commonType'

/**
 * @file-desc: 挂号，监控到有号之后调用挂号，开始挂号， 本文件中请求均需要挂代理进行操作
 * @author: huanghe
 */

/**
 * 获取某医院 某科室 某天的剩余号详情
 */
const getHosAndDeptDetail = async (
  firstDeptCode: string,
  secondDeptCode: string,
  hosCode: string,
  target: string,
  userid: string
): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const params = {
    firstDeptCode,
    secondDeptCode,
    hosCode,
    target
  }
  const res = await axios.post(
    `https://www.114yygh.com/web/product/detail?_time=${Date.now()}`,
    params,
    {
      headers
    }
  )
  // wnumber 为奇数表示还有余号 应用层面对剩余几个号不关注
}

/**
 * 判断用户是否实名
 */
const validateRealName = async (userid: string): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/user/real-name/status?_time=${Date.now()}`,
    {
      headers
    }
  )
  // status === "AUTH_PASS" 表明实名认证通过
}

/**
 * 确认预约详情
 */

const appointedConfirm = async (
  firstDeptCode: string,
  secondDeptCode: string,
  hosCode: string,
  target: string,
  dutyTime: string,
  uniqProductKey: string,
  userid: string
): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const params = {
    firstDeptCode,
    secondDeptCode,
    hosCode,
    target,
    dutyTime,
    uniqProductKey
  }
  const res = await axios.post(
    `https://www.114yygh.com/web/product/confirm?_time=${Date.now()}`
  )
}

/**
 * 获取就诊人信息  主要获取就诊人的卡
 */

const getPatientInfo = async (userid: string): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/patient/list?_time=${Date.now()}&showType=ORDER_CONFIRM`,
    {
      headers
    }
  )
}

/**
 * 提交挂号申请
 */

const saveAppointment = async (
  cardNo: string,
  cardType: string,
  firstDeptCode: string,
  secondDeptCode: string,
  hosCode: string,
  target: string,
  dutyTime: string,
  uniqProductKey: string,
  orderFrom: string,
  phone: string,
  treatmentDay: string,
  smsCode: string,
  userid: string
): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const params = {
    cardNo,
    cardType,
    firstDeptCode,
    secondDeptCode,
    hosCode,
    target,
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
      headers
    }
  )
}

/**
 * 查看预约是否成功
 */

const getAppointmentStatus = async (
  hosCode: string,
  orderNo: string,
  userid: string
): Promise<void> => {
  const headers = getRequestHeadersByUserId(userid)
  const res = await axios.get(
    `https://www.114yygh.com/web/order/detail?_time=${Date.now()}&hosCode=${hosCode}&orderNo=${orderNo}`,
    {
      headers
    }
  )
  // 如果预约成功需要在数据库中记录
  // 发送邮件到个人 并抄送谷歌邮箱
}

/**
 * 根据userid 匹配请求头
 */
const getRequestHeadersByUserId = (userid: string): ReqHeadersType => {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, `../../constants/usersCookie/${userid}.json`),
      'utf-8'
    )
  )
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

export default {}
