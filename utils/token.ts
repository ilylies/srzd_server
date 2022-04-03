import jwt from 'jsonwebtoken'
import config from '../config/token'
const jwtSecret = config.tokenKey

export const generateToken = (account: string | number, password: string) => {
  return new Promise((resolve, reject) => {
    const token = jwt.sign({ account, password }, jwtSecret, {
      expiresIn: config.tokenExpires,
    })
    resolve(token)
  })
}

export const getToken = (token: string) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject({ error: 'token是空的' })
    } else {
      console.log('token=', token)
      jwt.verify(token.split(' ')[1], jwtSecret,(err,info)=>{

        console.log('info=', info)
        resolve(info) //解析返回的值
      })
    }
  })
}
