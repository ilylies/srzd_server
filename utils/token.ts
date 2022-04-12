import jwt from 'jsonwebtoken'
import config from '../config/token'
const jwtSecret = config.tokenKey

export const generateToken = (id: number, name: string, password: string) => {
  return new Promise((resolve, reject) => {
    const token = jwt.sign({ id, name, password }, jwtSecret, {
      expiresIn: config.tokenExpires,
    })
    resolve(token)
  })
}

export const verifyToken = (token: string) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject({ error: 'token是空的' })
    } else {
      jwt.verify(token.split(' ')[1], jwtSecret,(err,info)=>{
        console.log('info=', info)
        resolve(info) //解析返回的值
      })
    }
  })
}
