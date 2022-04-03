import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  login: (account: string, password: string) => {
    const sql = `select * from users where account = '${account}' and password = '${password}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('登录查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('登录查询成功==========》', result)
          resolve(result[0])
        }
      })
    })
  },
  selectUesrList: (page: number, size: number, name: string) => {
    const sql = `select id, account, level, name from users where 1=1 ${
      name ? 'and name="' + name + '"' : ''
    } limit ${(page - 1) * size},${size}`
    const sqlCount = `select found_rows() as totalElements from users`
    const P1 = new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('用户列表查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('用户列表查询成功==========》', result)
          resolve(result)
        }
      })
    })
    const P2 = new Promise((resolve, reject) => {
      mysql.query(sqlCount, (err, result) => {
        if (err) {
          Logger.info('用户列表总数查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('用户列表总数查询成功==========》', result)
          resolve(result)
        }
      })
    })
    return new Promise((resolve, reject) => {
      Promise.all([P1, P2]).then(
        (result: any) => {
          resolve({
            content: result[0],
            totalElements: result[1][0].totalElements,
            page: Number(page),
            size: Number(size),
          })
        },
        (err) => {
          Logger.info('用户列表查询失败==========》', err)
          reject(err)
        },
      )
    })
  },
  createUser: (
    account: number,
    password: string,
    name: string,
    level: number,
  ) => {
    const sql = `INSERT INTO users ( account, password, name, level, create_time) VALUES  ( '${account}', '${password}', '${name}', '${level}', NOW() )`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建用户失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建用户成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  updateUser: (
    password: string,
    name: string,
    level: number,
  ) => {
    const sql = `UPDATE users SET password='${password}', name='${name}', level='${level}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建用户失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建用户成功==========》', result)
          resolve(true)
        }
      })
    })
  },
}
