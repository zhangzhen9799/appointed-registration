import fs from 'fs'
import path from 'path'

import { setCookie } from '../../utils/Cookie'
import { ReqHeadersType } from '../../types/commonType'

export const getRequestHeadersByUserId = (
  userid: string = '114'
): ReqHeadersType => {
  // console.log('getRequestHeadersByUserId userid', userid)
  if (userid === '114') {
    return JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../../constants/114Cookie.json'),
        'utf-8'
      )
    )
  } else {
    try {
      fs.accessSync(
        path.join(__dirname, `../../constants/usersCookie/${userid}.json`)
      )
    } catch (error) {
      return getRequestHeadersByUserId()
    }
    return JSON.parse(
      fs.readFileSync(
        path.join(__dirname, `../../constants/usersCookie/${userid}.json`),
        'utf-8'
      )
    )
  }
}

export const setRequestHeadersByUserId = (
  headers: any,
  userid: string = '114'
): ReqHeadersType => {
  console.log('setRequestHeadersByUserId userid', userid)
  const oldHeaders = getRequestHeadersByUserId(userid)
  setCookie(headers['set-cookie'], oldHeaders)
  if (userid === '114') {
    fs.writeFileSync(
      path.join(__dirname, '../../constants/114Cookie.json'),
      JSON.stringify(oldHeaders),
      {
        encoding: 'utf8'
      }
    )
  } else {
    fs.writeFileSync(
      path.join(__dirname, `../../constants/usersCookie/${userid}.json`),
      JSON.stringify(oldHeaders),
      {
        encoding: 'utf8'
      }
    )
  }

  return headers
}
