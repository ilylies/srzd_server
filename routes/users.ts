import express from 'express'
import userDb from '../db/user'
import response from '../utils/response'
import { generateToken } from '../utils/token'
const router = express.Router()

/* GET users listing. */
router.get('/login', (req, res, next) => {
  const { name, password }: any = req.query
  userDb
    .login(name, password)
    .then(async (data: any) => {
      if (data) {
        const token = await generateToken(data.name, data.password)
        response.success(res, {
          id: data.id,
          token,
          name: data.name,
          level: data.level
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
  const { page, size, name, level }: any = req.query
  userDb
    .selectUesrList(page, size, name, level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.post('/create', (req, res, next) => {
  const { password, name, level }: any = req.body
  userDb
    .createUser(password, name, level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.put('/update/:id', (req, res, next) => {
  const { password, name, level }: any = req.body
  const { id }: any = req.params
  userDb
    .updateUser(id, password, name, level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.get('/usersByLevel', (req, res, next) => {
  const { level }: any = req.query
  userDb
    .selectUsersByLevel(level)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.delete("/delete/:id", (req, res, next) => {
  const { id }: any = req.params;
  userDb
    .deteleUser(id)
    .then(async (data: any) => {
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});

export default router
