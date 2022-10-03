import { OrmDataSource } from 'src/database/orm-data-source'
import { User } from 'src/database/model/User'
import Utils from 'src/utils'
import { JwtTokenPayloadType } from 'src/types/createJwtToken'

const UserReposity = OrmDataSource.getRepository(User)
// export const login = () => {}

export const register = async (
  email: string,
  password: string
): Promise<User> => {
  // 邮箱是否已经被占用
  const res = await UserReposity.findOneBy({
    email
  })
  if (res !== null) {
    // 邮箱已经被占用
    throw new Error('邮箱已经被占用，注册失败...')
  }
  const user = new User()
  user.email = email
  await user.bcryptPassword(password)
  try {
    return await UserReposity.save(user)
  } catch (err) {
    throw new Error(err as string)
  }
}

export const login = async (
  email: string,
  password: string
): Promise<string | Boolean> => {
  const user = await UserReposity.findOneBy({ email })
  if (user !== null) {
    const validateRes = await user.validatePassword(password)
    if (validateRes === true) {
      const jwtPayload: JwtTokenPayloadType = {
        id: user.userId,
        name: user.nikeName,
        email: user.email,
        created_at: new Date()
      }
      const token = Utils.createJwtToken(jwtPayload)
      return token
    }
  }
  return false
}

export const changePassword = async (
  email: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = await UserReposity.findOneBy({
      email
    })
    if (user !== null) {
      await user.bcryptPassword(newPassword)
      try {
        await UserReposity.save(user)
      } catch (err) {
        throw new Error(err as string)
      }
    }
  } catch (err) {
    throw new Error(err as string)
  }
}
