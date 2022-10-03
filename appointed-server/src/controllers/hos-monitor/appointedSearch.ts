import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'

import { OrmDataSource } from 'src/database/orm-data-source'
import { Hospital } from 'src/database/model/Hospital'
import { Department } from 'src/database/model/Department'
import { setCookie } from 'src/utils/Cookie'
import { requestDelay } from 'src/utils/common/requestDelay'
import Utils from 'src/utils'

const HospitalReposity = OrmDataSource.getRepository(Hospital)
const Manager = OrmDataSource.manager

export const getHosList = (
  pageNo: number = 1,
  pageSize: number = 20,
  headers: any
): Promise<any> => {
  return axios
    .get(
      `https://www.114yygh.com/web/hospital/list?_time=${Date.now()}&keywords=&levelId=0&areaId=0&pageNo=${pageNo}&pageSize=${pageSize}`,
      { headers }
    )
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
      return res.data
    })
    .catch((err) => {
      console.log(err)
      throw new Error(err)
    })
}

/**
 * 根据医院code - 科室列表
 */
export const getDepartListByHosCode = (
  hosCode: string,
  headers: any
): Promise<any> => {
  return axios
    .get(
      `https://www.114yygh.com/web/department/hos/list?_time=${Date.now()}&hosCode=${hosCode}`,
      { headers }
    )
    .then((res: any) => {
      setCookie(res.headers['set-cookie'], headers)
      return res.data
    })
    .catch(() => {
      console.log('errrrrrrrrrrrr=========')
    })
}

// 医院列表存入数据库
export const setAllHosListToSql = async (headers: any): Promise<void> => {
  const pageSize = 200
  let pageNo = 1
  let curCount = 0
  let totalCount = Number.MAX_SAFE_INTEGER
  // 先清除Hospital表中所有的数据
  try {
    await Manager.clear(Hospital)
  } catch (error) {
    console.log(error)
  }
  while (totalCount > curCount) {
    const { data } = await getHosList(pageNo, pageSize, headers)

    totalCount = data.count
    const hosList = (data.list as Hospital[]).map((item): Hospital => {
      if (item.picture !== null) {
        item.picture = item.picture.replace(/^\/\//, 'https://')
      }

      return item
    })
    console.log(chalk.green(`正在将第${pageNo}页数据插入数据库`))
    // 将医院数据存放到数据库
    try {
      await OrmDataSource.createQueryBuilder()
        .insert()
        .into(Hospital)
        .values(hosList)
        .execute()
    } catch (error) {
      console.log(error)
    }

    console.log(chalk.green(`第${pageNo}页数据插入数据库完成`))
    curCount += hosList.length
    pageNo++
  }
  console.log(`${curCount}条数据已经全部插入数据库中...`)
}
// 科室列表存入数据库
export const setAllDepartListToSql = async (headers: any): Promise<void> => {
  try {
    await Manager.clear(Department)
  } catch (error) {
    console.log(error)
  }
  // 查询医院表，遍历获取其所有科室信息
  const allHospitalList = await HospitalReposity.createQueryBuilder().getMany()
  const allHosCount = allHospitalList.length
  for (let i = 0; i < allHosCount; i++) {
    const item = allHospitalList[i]
    const hosCode = item.code

    try {
      const {
        data: { list }
      } = await Utils.asyncTaskRetry(
        () => requestDelay(getDepartListByHosCode, [item.code, headers]),
        validateDepInfo,
        1000,
        10
      )

      console.log('index', i)

      const depList = list.map(async (item: any): Promise<Department> => {
        const parent = new Department().initDepartment(
          Object.assign(item, { hoscode: hosCode, level: 1 })
        )
        await OrmDataSource.createQueryBuilder()
          .insert()
          .into(Department)
          .values([parent])
          .execute()

        const children: Department[] = item.subList.map(
          (v: any): Department => {
            const child = new Department().initDepartment(
              Object.assign(v, { hoscode: hosCode, level: 2 })
            )
            child.parent = parent
            return child
          }
        )
        await OrmDataSource.createQueryBuilder()
          .insert()
          .into(Department)
          .values(children)
          .execute()
          .catch((err) => {
            throw new Error(err)
          })

        return parent
      })
    } catch (error) {
      console.log(error)
    }
  }
  console.log(chalk.green('所有科室信息保存完成'))
}

// 判断获取到的科室信息是否正确
export const validateDepInfo = (res: any): boolean => {
  if (res?.data !== undefined) {
    return true
  } else {
    return false
  }
}

const getHeaders = (): any => {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../constants/114Cookie.json'),
      'utf-8'
    )
  )
}

export const setAllHosListToSqlAsync = (): Promise<any> => {
  const headers = getHeaders()
  return setAllHosListToSql(headers).catch((err) => {
    return err
  })
}

export const setAllDepartListToSqlAsync = (): Promise<any> => {
  const headers = getHeaders()
  return setAllDepartListToSql(headers).catch((err) => {
    return err
  })
}

/**
 * 已经注册用户，输入医院名称进行筛选， 保留hosCode 162
 * 根据hosCode获取科室信息 10c186f26ae7ecf8160e2dcf1f2e7312 200053529
 * 用户输入起始监控日期（默认就是当前时间）和结束监控日期（目标预约日期）
 *
 *
 * Todo:
 * 1. 新建一张表用户记录上述信息
 * 2. 用户的登录信息如何保存 Cookie
 * 3. 如何判断时间是否到达开始监控日期
 * 4. 对于到达监控日期的预约单，开启子进程刷接口
 * 5. 对于到达结束监控日期的子进程进行关闭，关闭这个操作可以放到上一步中
 *
 */
