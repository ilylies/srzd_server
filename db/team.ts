import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  selectTeamList: (page: number, size: number, name: string) => {
    const sql = `select id, name, captain, members from team where 1=1 ${name ? 'and name="' + name + '"' : ''
      } limit ${(page - 1) * size},${size}`
    const sqlCount = `SELECT FOUND_ROWS() as totalElements`
    const P1 = new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('团队列表查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('团队列表查询成功==========》', result)
          result.forEach((element: any) => {
            element.members = element.members.split(',').map((i: String) => Number(i))
          })
          resolve(result)
        }
      })
    })
    const P2 = new Promise((resolve, reject) => {
      mysql.query(sqlCount, (err, result) => {
        if (err) {
          Logger.info('团队列表总数查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('团队列表总数查询成功==========》', result)
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
          Logger.info('团队列表查询失败==========》', err)
          reject(err)
        },
      )
    })
  },
  createTeam: (
    name: number,
    captain: number,
    members: []
  ) => {
    const sql = `INSERT INTO team ( name, captain, members, create_time) VALUES  ( '${name}', '${captain}', '${members.join(',')}',  NOW() )`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建团队失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建团队成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  updateTeam: (
    id: number,
    name: string,
    captain: string,
    members: number,
  ) => {
    const sql = `UPDATE team SET name='${name}', captain='${captain}', members='${members}' where id='${id}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建团队失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建团队成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  deteleTeam: (
    id: number
  ) => {
    const sql = `DELETE FROM team WHERE id='${id}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('删除团队失败==========》', err)
          reject(err)
        } else {
          Logger.info('删除团队成功==========》', result)
          resolve(true)
        }
      })
    })
  },
}
