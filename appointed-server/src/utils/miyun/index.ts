import axios from 'axios'
import chalk from 'chalk'

import { asyncTaskRetry } from '../common/asyncTaskRetry'
/**
 * miyun接口所需配置信息
 */
const miyunToken = '5bdb7fc3ad64-381186'
const projectId = '54427'
const miyunHost = 'http://api.miyun9988.xyz:9002'

/**
 * 从miyun平台取出一个临时手机号
 */

export const getPhoneNum = (): Promise<string> => {
  return axios
    .get(
      `${miyunHost}/api/get_mobile?token=${miyunToken}&project_id=${projectId}&scope_black=170,171`
    )
    .then((res: any) => {
      return res.data.mobile
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * 查看取出手机号收到的短信信息
 */

export const getMessageByPhone = (
  phone: string,
  wait: number = 300,
  retryCount: number = 200
): Promise<any> => {
  const url = `${miyunHost}/api/get_message?token=${miyunToken}&project_id=${projectId}&phone_num=${phone}`
  console.log('获取短信信息url=>', url)
  return asyncTaskRetry(
    () => axios.get(url),
    validateMessageExpect,
    wait,
    retryCount
  )
    .then((res: any) => {
      return res.data
    })
    .catch(async (err) => {
      console.log('getMessageByPhone=====', err)
      await addPhoneBlacklist(phone)
    })
}

/**
 * 拉黑手机号
 */
export const addPhoneBlacklist = (phone: string): Promise<void> => {
  return axios
    .get(
      `${miyunHost}/api/add_blacklist?token=${miyunToken}&project_id=${projectId}&phone_num=${phone}`
    )
    .then((res) => {
      console.log(chalk.green(`拉黑手机号-${phone}`))
    })
    .catch((err) => {
      throw new Error(err)
    })
}

// 手机收到的短信信息是否符合预期
const validateMessageExpect = (res: any): boolean => {
  console.log('validateMessageExpect====', res.data)
  if (res.data?.code !== '') {
    return true
  } else {
    return false
  }
}

// getMessageByPhone('16211077896', 3000, 200).catch((err) => {
//   throw new Error(err)
// })
