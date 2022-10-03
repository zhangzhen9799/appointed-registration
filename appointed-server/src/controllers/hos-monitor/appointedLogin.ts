import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import Tesseract from 'tesseract.js'
import sharp from 'sharp'
import CryptoJS from 'crypto-js'
import Utils from 'src/utils'

import { setCookie } from 'src/utils/Cookie'

/**
 * 获取医院列表挂号接口
 */
const headers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../constants/114Cookie.json'), 'utf-8')
)

let phone = ''

/**
 * 获取登录图片验证码
 */
export const getImageCode = (): Promise<any> => {
  return axios
    .get(`https://www.114yygh.com/web/img/getImgCode?_time=${Date.now()}`, {
      headers,
      responseType: 'arraybuffer'
    })
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
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
 * 校验图片验证码并发送短信
 */
export const validatePhoneAndImageCode = async (code: string): Promise<any> => {
  console.log('code==>', code)
  return new Promise((resolve, reject): void => {
    const timer = setTimeout(() => {
      resolve('')
      clearTimeout(timer)
    }, 3000)
  })
    .then(() => {
      return axios
        .get(
          `https://www.114yygh.com/web/checkcode?_time=${Date.now()}&code=${code}`,
          {
            headers
          }
        )
        .then(async (res: any) => {
          setCookie(res.headers['set-cookie'], headers)
          console.log('res.data.data===>', res.data.data)

          if (res.data.data === true) {
            phone = await Utils.getPhoneNum()
            console.log('获取到的临时手机号==>', phone)
            const cipherPhone = cryptoText(phone)
            console.log('cipherPhone==>', cipherPhone)
            return axios
              .get(
                `https://www.114yygh.com/web/common/verify-code/get?_time=${Date.now()}&mobile=${encodeURIComponent(
                  cipherPhone
                )}&smsKey=LOGIN&code=${code}`,
                {
                  headers
                }
              )
              .then((res: any) => {
                setCookie(res.headers['set-cookie'], headers)
                // 当前状态就是已经发送短信了，去查询短信验证码
                console.log('===短信验证码发送成功====')
                console.log(res.data)
                console.log('此时phone==>', phone)
                return Utils.getMessageByPhone(phone)
                  .then((res) => {
                    // console.log('短信信息==>', res.data)
                    // 根据短信验证码去完成登录
                    return res.data
                  })
                  .catch((err) => {
                    throw new Error(err)
                  })
              })
              .catch((err) => {
                throw new Error(err)
              })
          } else {
            // 大概率是图片验证码过期或者是识别失败
            // 这里就可以做一个重新获取验证码，走重试逻辑
            console.log('图片验证码验证失败，进行重试')
            tmpLogin().catch((err) => {
              throw new Error(err)
            })
          }
        })
        .catch((err) => {
          throw new Error(err)
        })
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * 根据短信验证码 + 手机号完成登录
 */
export const login114 = (mobile: string, code: string): Promise<any> => {
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
      setCookie(res.headers['set-cookie'], headers)
      return '临时账号登录成功....'
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
  const { data } = await getImageCode()
  const codeText = await distinguishImage(data)
  if (Array.isArray(/\d{4}/.exec(codeText))) {
    const messageInfo = await validatePhoneAndImageCode(
      (/\d{4}/.exec(codeText) as any[])[0]
    )
    // console.log(messageInfo)
    if (messageInfo !== undefined) {
      // 此时短信信息已经获取到
      const regRes = /【(\w+)】/.exec(messageInfo.modle)
      if (regRes !== null) {
        const messCode = regRes[1]
        const res = await login114(phone, messCode)
        // console.log(res)
        // 保存请求头到文件中, 方便第二次使用
        fs.writeFileSync(
          path.join(__dirname, '../../constants/114Cookie.json'),
          JSON.stringify(headers),
          {
            encoding: 'utf8'
          }
        )
      }
    }
  } else {
    // 重试获取图片验证码
    console.log(chalk.green('图片验证码验证失败....开始重试'))
    tmpLogin().catch((err) => {
      throw new Error(err)
    })
  }
}

// tmpLogin().catch((err) => {
//   throw new Error(err)
// })

/**
 *
 */
