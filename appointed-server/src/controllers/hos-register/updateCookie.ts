import axios from 'axios'
import { setCookie } from '../../utils/Cookie'
import { ReqHeadersType } from '../../types/commonType'
import HttpProxyConfig from '../../utils/common/httpProxy'

export const getImageCode = (headers: ReqHeadersType): Promise<any> => {
  return axios
    .get(`https://www.114yygh.com/web/img/getImgCode?_time=${Date.now()}`, {
      headers,
      responseType: 'arraybuffer',
      ...HttpProxyConfig
    })
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

export const getRegistrationDetails = (
  hosCode: string,
  firstDeptCode: string,
  secondDeptCode: string,
  week: number,
  headers: ReqHeadersType
): Promise<any> => {
  return axios
    .post(
      `https://www.114yygh.com/web/product/list?_time=${Date.now()}`,
      {
        firstDeptCode,
        secondDeptCode,
        hosCode,
        week
      },
      {
        headers,
        ...HttpProxyConfig
      }
    )
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
      return res
    })
    .catch((err) => {
      throw new Error(err)
    })
}
