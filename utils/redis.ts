import redis from 'ioredis'
import logger from '../middleware/logger.middleware'
import { Logger } from './log4js'
const client = new redis()

export const setCache = (key: string, val: any, expire: number = 5 * 60) => {
  client.set(key, val)
  client.expire(key, expire)
  Logger.info('储存redis数据====》', `key=${key}，val=${val}，expire=${expire}`)
}

export const getCache = (key: string) => {
  return new Promise(async (resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) {
        reject(err)
        Logger.error('获取缓存数据失败====》', err)
      } else {
        Logger.info('获取缓存数据====》', `key=${key}，data=${data}`)
        resolve(data)
      }
    })
  })
}
