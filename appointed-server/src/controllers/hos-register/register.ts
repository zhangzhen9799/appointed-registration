import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import Utils from 'src/utils'

/**
 * @file-desc: 挂号，监控到有号之后调用挂号，开始挂号
 * @author: huanghe
 */

/**
 * 获取某医院 某科室 某天的剩余号详情
 */
const getHosAndDeptDetail = (): void => {

}

/**
 * 判断用户是否实名
 */
const validateRealName = (): void => {}

/**
 * 确认预约详情
 */

const appointedConfirm = (): void => {}

/**
 * 获取就诊人信息  主要获取就诊人的卡
 */

const getPatientInfo = (): void => {}

/**
 * 挂号
 */

const saveAppointment = (): void => {}

/**
 * 查看预约是否成功
 */

const getAppointmentStatus = (): void => {}

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
 */

export default {}
