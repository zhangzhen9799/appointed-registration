import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import Tesseract from 'tesseract.js'
import sharp from 'sharp'
import CryptoJS from 'crypto-js'
import Utils from 'src/utils'
import {
  getRequestHeadersByUserId,
  setRequestHeadersByUserId
} from 'src/utils/common/requestHeader114'

/**
 * 获取登录图片验证码
 */
export const getImageCode = (userid: string): Promise<any> => {
  const headers = getRequestHeadersByUserId(userid)
  return axios
    .get(`https://www.114yygh.com/web/img/getImgCode?_time=${Date.now()}`, {
      headers,
      responseType: 'arraybuffer'
    })
    .then((res: any) => {
      setRequestHeadersByUserId(res.headers, userid)
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

/**
 * 加密字符串
 *
 */
const cryptoText = (text: string): string => {
  const key = CryptoJS.enc.Utf8.parse('imed2019imed2019')
  const iv = CryptoJS.enc.Utf8.parse('imed2019imed2019')
  const cipherText = CryptoJS.AES.encrypt(text, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    iv
  })
    .toString()
    .replace(/\+/gi, '-')
    .replace(/\//gi, '_')
  return cipherText
}

/**
 * 校验图片验证码
 */
export const validateImageCode = async (
  code: string,
  userid: string
): Promise<Boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  return axios
    .get(
      `https://www.114yygh.com/web/checkcode?_time=${Date.now()}&code=${code}`,
      {
        headers
      }
    )
    .then(async (res: any) => {
      setRequestHeadersByUserId(res.headers, userid)

      if (res.data.data === true) {
        return true
      } else {
        // 大概率是图片验证码过期或者是识别失败
        // 这里就可以做一个重新获取验证码，走重试逻辑
        // console.log('图片验证码验证失败，进行重试')
        return false
      }
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * 获取临时手机号
 */
const getTmpPhone = async (): Promise<string> => {
  const phone = await Utils.getPhoneNum()
  return phone
}

/**
 * 手机号和图片验证码 发送短信验证码
 */

const sendToPhoneMsg = async (
  phone: string,
  imgCode: string,
  userid: string
): Promise<any> => {
  const headers = getRequestHeadersByUserId(userid)
  const cipherPhone = cryptoText(phone)
  console.log('cipherPhone==>', cipherPhone)
  return axios
    .get(
      `https://www.114yygh.com/web/common/verify-code/get?_time=${Date.now()}&mobile=${encodeURIComponent(
        cipherPhone
      )}&smsKey=LOGIN&code=${imgCode}`,
      {
        headers
      }
    )
    .then((res: any) => {
      setRequestHeadersByUserId(res.headers, userid)
      // 当前状态就是已经发送短信了，去查询短信验证码
      console.log('sendToPhoneMsg====', res.data)
      console.log('===短信验证码发送成功====')
      console.log('此时phone==>', phone)
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * 根据短信验证码 + 手机号完成登录
 */
export const login114 = (
  mobile: string,
  code: string,
  userid: string
): Promise<Boolean> => {
  const headers = getRequestHeadersByUserId(userid)
  console.log('login114-params', mobile, code, headers.Cookie)
  return axios
    .post(
      `https://www.114yygh.com/web/login?_time=${Date.now()}`,
      {
        code: cryptoText(code),
        mobile: cryptoText(mobile)
      },
      {
        headers
      }
    )
    .then((res: any) => {
      // 登录成功 更新cookie
      if (res.data.resCode === 0) {
        setRequestHeadersByUserId(res.headers, userid)
        console.log(`${mobile} - 登录成功`)
        return true
      } else {
        return false
      }
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * 传入图片或者是buffer 识别图片获取验证码
 * 目前准确度还有待提高
 */

export const distinguishImage = async (
  image: string | Buffer
): Promise<string> => {
  // 文件处理完成保存位置
  const imgPath = path.join(__dirname, '../../static/images/sharp_code.jpg')
  // 将图片二值化处理
  await sharp(image)
    .resize({ height: 240, width: 560 })
    .threshold(180) // 默认128
    .extract({ width: 412, height: 132, left: 72, top: 60 })
    .toFile(imgPath)
  const {
    data: { text }
  } = await Tesseract.recognize(imgPath, 'eng', {
    logger: (m) => console.log(m)
  })
  return text
}

/**
 * 临时登录
 */
export const tmpLogin = async (): Promise<void> => {
  const userid = '114'
  const { data } = await getImageCode(userid)
  const codeText = await distinguishImage(data)
  if (Array.isArray(/\d{4}/.exec(codeText))) {
    const imgCode = (/\d{4}/.exec(codeText) as any[])[0]
    const validateImageCodeRes = await validateImageCode(imgCode, userid)
    if (validateImageCodeRes === true) {
      const phone = await getTmpPhone()
      await sendToPhoneMsg(phone, imgCode, userid)
      const tmpMsgInfo = await Utils.getMessageByPhone(phone)
      console.log('tmpMsgInfo===', tmpMsgInfo)
      // 此时短信信息已经获取到
      const regRes = /【(\w+)】/.exec(tmpMsgInfo.modle)
      if (regRes !== null) {
        const smscode = regRes[1]
        await login114(phone, smscode, userid)
        console.log(chalk.green('114平台登录成功...'))
        // 保存请求头到文件中, 方便第二次使用
      }
    } else {
      console.log(chalk.green('图片验证码验证失败....开始重试'))
      tmpLogin().catch((err) => {
        throw new Error(err)
      })
    }
  } else {
    // 重试获取图片验证码
    console.log(chalk.green('图片验证码验证失败....开始重试'))
    tmpLogin().catch((err) => {
      throw new Error(err)
    })
  }
}

/**
 * 用户登录-发送短信验证码
 */
export const userLoginSendMsg = async (
  phone: string,
  userid: string
): Promise<Boolean> => {
  const { data } = await getImageCode(userid)
  const codeText = await distinguishImage(data)
  if (Array.isArray(/\d{4}/.exec(codeText))) {
    const imgCode = (/\d{4}/.exec(codeText) as any[])[0]
    const validateImageCodeRes = await validateImageCode(imgCode, userid)
    if (validateImageCodeRes === true) {
      await sendToPhoneMsg(phone, imgCode, userid)
      return true
    } else {
      console.log(chalk.green('图片验证码验证失败....开始重试'))
      return userLoginSendMsg(phone, userid).catch((err) => {
        throw new Error(err)
      })
    }
  } else {
    // 重试获取图片验证码
    console.log(chalk.green('图片验证码验证失败....开始重试'))
    return userLoginSendMsg(phone, userid).catch((err) => {
      throw new Error(err)
    })
  }
}

/**
 * 用户登录-提交短信验证码
 */

export const userLoginPhone = async (
  phone: string,
  smscode: string,
  userid: string
): Promise<Boolean> => {
  try {
    const loginStatus = await login114(phone, smscode, userid)
    return loginStatus
  } catch (err) {
    throw new Error(err as string)
  }
}
