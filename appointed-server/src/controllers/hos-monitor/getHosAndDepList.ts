import { Like } from 'typeorm'

import { OrmDataSource } from 'src/database/orm-data-source'
import { Hospital } from 'src/database/model/Hospital'
import { Department } from 'src/database/model/Department'

import Utils from 'src/utils'

const HospitalRepository = OrmDataSource.getRepository(Hospital)
const DepartmentRepository = OrmDataSource.getRepository(Department)

export const getHosList = async (
  query: Partial<Hospital>,
  pageNo: number = 1,
  pageSize: number = 20
): Promise<any> => {
  const { name = '', levelText = '' } = query
  return HospitalRepository.findAndCount({
    where: {
      name: Like(`%${name}%`),
      levelText: Like(`%${levelText}%`)
    },
    skip: (pageNo - 1) * pageSize,
    take: pageSize
  })
}

export const getDepListByHosCode = async (
  query: Partial<Department>
): Promise<any> => {
  const { hoscode = '', name = '' } = query
  return DepartmentRepository.createQueryBuilder('department')
    .where('department.hoscode = :hosCode', { hosCode: hoscode })
    .andWhere('department.level = 1')
    .getMany()
    .then(async (val) => {
      const promiseList = []
      for (let i = 0; i < val.length; i++) {
        promiseList.push(
          OrmDataSource.manager
            .getTreeRepository(Department)
            .findDescendantsTree(val[i])
        )
      }
      if (promiseList.length > 0) {
        return Promise.all(promiseList)
      } else {
        return null
      }
    })
}

// setTimeout(() => {
//   // getHosList({ name: '北京' }, 1, 20)
//   //   .then((res) => {
//   //     console.log(res)
//   //   })
//   //   .catch((err) => {
//   //     throw new Error(err)
//   //   })
//   // getDepListByHosCode({ hoscode: '162', name: '口腔' })
//   //   .then((res) => {
//   //     console.log(res)
//   //   })
//   //   .catch((err) => {
//   //     throw new Error(err)
//   //   })
// }, 1000)
