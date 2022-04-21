import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  create: (values) => {
    Logger.info('values=================================>',values)
    const sql = `INSERT INTO loan_situation ( appropriation_status, amount, sid, create_time) VALUES  ?`
    return new Promise((resolve, reject) => {
      mysql.query(sql, [values], (err, result) => {
        if (err) {
          Logger.info('新建放款数据失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建放款数据成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  selectBySid: (sid: number) => {
    const sql = `select * from loan_situation where sid='${sid}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('查询放款数据失败==========》', err)
          reject(err)
        } else {
          Logger.info('查询放款数据成功==========》', result)
          resolve(result)
        }
      })
    })
  },
  deleteBySid: (sid: number) => {
    const sql = `DELETE FROM loan_situation where sid='${sid}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('删除放款数据失败==========》', err)
          reject(err)
        } else {
          Logger.info('删除放款数据成功==========》', result)
          resolve(result)
        }
      })
    })
  }
}
