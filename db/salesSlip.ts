import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  selectSalesSlipList: (page: number, size: number, company_name: string, company_tags: number, appropriation_status: number|string, team: number, telemarketer: number) => {
    const sql = `select * from sales_slip where 1=1 ${
      company_name ? 'and company_name="' + company_name + '"' : ''
    } ${
      company_tags ? 'and company_tags="' + company_tags + '"' : ''
    } ${
      appropriation_status ? 'and appropriation_status="' + appropriation_status + '"' : ''
    } ${
      team ? 'and team="' + team + '"' : ''
    } ${
      telemarketer ? 'and telemarketer="' + telemarketer + '"' : ''
    } limit ${(page - 1) * size},${size}`
    const sqlCount = `SELECT FOUND_ROWS() as totalElements`
    const P1 = new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('销售单列表查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('销售单列表查询成功==========》', result)
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
            size: Number(size)
          })
        },
        (err) => {
          Logger.info('团队列表查询失败==========》', err)
          reject(err)
        }
      )
    })
  },
  createSalesSlip: (
    company_name: string,
    company_contact_name: string,
    company_phone: string,
    company_tags: number,
    record: string,
    appropriation_status: number,
    team: number,
    telemarketer: number
  ) => {
    const sql = `INSERT INTO sales_slip ( company_name, company_contact_name, company_phone, company_tags, record,appropriation_status,team,telemarketer,create_time) 
    VALUES  ( '${company_name}', '${company_contact_name}', '${company_phone}','${company_tags}','${record}','${appropriation_status}','${team}','${telemarketer}',  NOW() )`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建销售单失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建销售单成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  updateSalesSlip: (
    id: number,
    company_name: string,
    company_contact_name: string,
    company_phone: string,
    company_tags: number,
    record: string,
    appropriation_status: number,
    team: number,
    telemarketer: number
  ) => {
    const sql = `UPDATE sales_slip SET company_name='${company_name}', company_contact_name='${company_contact_name}', company_phone='${company_phone}', company_tags='${company_tags}', record='${record}', company_phone='${company_phone}', appropriation_status='${appropriation_status}', team='${team}', telemarketer='${telemarketer}' where id='${id}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('修改销售单失败==========》', err)
          reject(err)
        } else {
          Logger.info('修改销售单成功==========》', result)
          resolve(true)
        }
      })
    })
  },
  deteleSalesSlip: (id: number) => {
    const sql = `DELETE FROM sales_slip WHERE id='${id}'`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('删除销售单失败==========》', err)
          reject(err)
        } else {
          Logger.info('删除销售单成功==========》', result)
          resolve(true)
        }
      })
    })
  }
}
