import request from 'axios'
import { Logger } from '../utils/log4js'
export default {
  get: (url: string) => {
    return new Promise((resolve, reject) => {
      request.get(url).then((res:any) => {
        Logger.info(`${url}请求响应=======`, res.data)
        resolve(res.data)
      }).catch((err)=>{
        Logger.info(`${url}请求失败=======`, err)
        reject(err)
      })
    })
  },
  post: (url: string, data: any) => {
    return new Promise((resolve, reject) => {
      request.post(url, data).then(res=>{
        Logger.info(`${url}请求响应=======`, res.data)
        resolve(res.data)
      }).catch((err)=>{
        Logger.info(`${url}请求失败=======`, err)
        reject(err)
      })
    })
  },
}
