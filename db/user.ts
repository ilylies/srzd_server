import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  login: (name: string, password: string) => {
    const sql = `select * from users where name = '${name}' and password = '${password}'`
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
  selectUesrList: (page: number, size: number, name: string, level: number) => {
    const sql = `select id, level, name from users where 1=1 ${
      name ? 'and name LIKE "%' + name + '%"' : ''
    } ${level ? 'and level="' + level + '"' : ''}  limit ${
      (page - 1) * size
    },${size}`
    console.log(sql)
    const sqlCount = `SELECT FOUND_ROWS() as totalElements`
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
            size: Number(size)
          })
        },
        (err) => {
          Logger.info('用户列表查询失败==========》', err)
          reject(err)
        }
      )
    })
  },
  createUser: (password: string, name: string, level: number) => {
    const sql = `INSERT INTO users ( password, name, level, create_time) VALUES  ( '${password}', '${name}', '${level}', NOW() )`
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
  updateUser: (id: number, password: string, name: string, level: number) => {
    const sql = `UPDATE users SET password='${password}', name='${name}', level='${level}' where id='${id}'`
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
  selectUsersByLevel: (level: string) => {
    console.log(level)
    let val = [level]
    if (level.length > 1) {
      val = level.split(',')
    }
    if (!level) {
      val = ['1', '2', '3']
    }

    console.log(val)
    const sql = `select id, level, name from users where (level='${
      val[0]
    }' or level='${
      val.length == 3
        ? val[2] + `' or level='${val[1]}`
        : val.length == 2
        ? val[1]
        : val[0]
    }')`
    console.log(sql, 11111)
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('根据等级查询用户失败==========》', err)
          reject(err)
        } else {
          Logger.info('根据等级查询用户成功==========》', result)
          resolve(result)
        }
      })
    })
  },
  deteleUser: (id: number) => {
    const sql = `DELETE FROM users WHERE id='${id}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('删除用户失败==========》', err)
          reject(err)
        } else {
          Logger.info('删除用户成功==========》', result)
          resolve(true)
        }
      })
    })
  }
}
