import { Request, Response } from 'express'

import Utils from 'src/utils'
import { register, login, changePassword } from 'src/controllers/auth'
import { validateReqHeaderToken } from 'src/middleware/index'

@Utils.Controller('/')
class Auth {
  @Utils.Post('register')
  registerHandle(req: Request, res: Response): void {
    const { email, password } = req.body
    console.log(email, password)
    register(email as string, password as string)
      .then((val) => {
        if (val !== null) {
          Utils.response(res, { data: true })
        }
      })
      .catch(() => {
        return Utils.response(res, { data: false }, 200, '注册失败，请稍候重试')
      })
  }

  @Utils.Post('login')
  loginHandle(req: Request, res: Response): void {
    const { email, password } = req.body
    login(email as string, password as string)
      .then((val) => {
        if (typeof val === 'string') {
          Utils.response(res, { token: val })
        } else {
          Utils.response(res, null, 404, '登录失败，请检查账号密码')
        }
      })
      .catch(() => {
        return Utils.response(res, { data: false }, 200, '登录失败，请稍候重试')
      })
  }

  @Utils.Post('change-password')
  @Utils.Use([validateReqHeaderToken])
  changePasswordHandle(req: Request, res: Response): void {
    // 验证请求头已经成功
    const { password } = req.body
    const { email } = Utils.getUserInfoByToken(
      (req.get('Authorization') as string).split(' ')[1]
    )
    changePassword(email, password)
      .then((result) => {
        Utils.response(res, { status: result })
      })
      .catch(() => {
        return Utils.response(
          res,
          { data: false },
          200,
          '修改密码失败，请稍候重试'
        )
      })
  }
}

export default Utils.classToRouter(Auth)
