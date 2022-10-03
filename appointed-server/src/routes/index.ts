import { Router } from 'express'
import auth from './auth/authClass'
import API_114 from './114/index'

const router = Router()

router.use('/v1', auth)
router.use('/114', API_114)

export default router
