import express from 'express'
import userDb from '../db/user'
import response from '../utils/response'
import { generateToken } from '../utils/token'
const router = express.Router()

/* GET users listing. */
router.get('/login', (req, res, next) => {
  const { account, password }: any = req.query
  userDb
    .login(account, password)
    .then(async (data: any) => {
      if (data) {
        const token = await generateToken(data.account, data.password)
        response.success(res, {
          id: data.id,
          token,
          account: data.account,
          userName: data.name,
        })
      } else {
        response.fail(res, '账号或密码错误')
      }
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.get('/list', (req, res, next) => {
  const { page, size, name }: any = req.query
  userDb
    .selectUesrList(page, size, name)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.post('/create', (req, res, next) => {
  const { account, password, name, level }: any = req.body
  userDb
    .createUser(account, password, name, level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.put('/update', (req, res, next) => {
  const {password, name, level }: any = req.body
  userDb
    .updateUser( password, name, level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

export default router
