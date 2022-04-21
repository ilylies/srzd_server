import wechatConfig from '../config/wechat'
import request from '../server'
import { Logger } from '../utils/log4js'
import { setCache, getCache } from './redis'

function getAccessToken() {
  return new Promise(async (resolve, reject) => {
    const getAccessTokenCache = await getCache('accessToken')
    if (getAccessTokenCache) {
      resolve(getAccessTokenCache)
      return
    }
    request
      .get(
        `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${wechatConfig.corpid}&corpsecret=${wechatConfig.corpsecret}`,
      )
      .then((res: any) => {
        Logger.info('获取企业微信accessToken成功========》', res)
        setCache('accessToken', res.access_token, res.expires_in)
        resolve(res.access_token)
      })
      .catch((err) => {
        Logger.info('获取企业微信accessToken失败========》', err)
        reject(err)
      })
  })
}

function sendMsg(content: any) {
  return new Promise(async (resolve, reject) => {
    const ACCESS_TOKEN = await getAccessToken()
    request
      .post(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${ACCESS_TOKEN}`,
        {
          agentid: 1000002,
          msgtype: 'text',
          text: { content },
          touser: '@all',
        },
      )
      .then((res: any) => {
        if (res.errcode === 0) {
          Logger.info('发送消息成功========》', res)
        } else {
          Logger.info('发送消息失败========》', res.errmsg)
        }
      })
      .catch((err) => {
        Logger.info('发送消息失败========》', err)
        reject(err)
      })
  })
}

export { getAccessToken, sendMsg }
