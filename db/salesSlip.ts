import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  selectSalesSlipList: (
    page: number,
    size: number,
    company_name: string,
    company_tags: number,
    appropriation_status: number | string,
    team: number,
    telemarketer: number,
    userId: number,
    level: number,
    teamId: number
  ) => {
    let sql = `select * from sales_slip where 1=1 ${
      company_name ? 'and company_name="' + company_name + '"' : ''
    } ${company_tags ? 'and company_tags="' + company_tags + '"' : ''} ${
      appropriation_status
        ? 'and appropriation_status="' + appropriation_status + '"'
        : ''
    } ${team ? 'and team="' + team + '"' : ''} ${
      telemarketer ? 'and telemarketer="' + telemarketer + '"' : ''
    }`

    if (level === 2) {
      sql += ` and (team='${teamId}' or telemarketer='${userId}')`
    }
    if (level === 3) {
      sql += ` and telemarketer='${userId}'`
    }
    sql += ` limit ${(page - 1) * size},${size}`
    Logger.info('销售单列表查询sql==========》', sql)
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
  createSalesSlip: (
    company_name: string,
    company_contact_name: string,
    loan_amount: string,
    company_tags: number,
    record: string,
    appropriation_status: number,
    team: number,
    telemarketer: number,
  ) => {
    const sql = `INSERT INTO sales_slip ( company_name, company_contact_name, loan_amount, company_tags, record,appropriation_status,team,telemarketer,create_time) 
    VALUES  ( '${company_name}', '${company_contact_name}', '${loan_amount}','${company_tags}','${record}','${appropriation_status}','${team}','${telemarketer}',  NOW() )`
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
    loan_amount: string,
    company_tags: number,
    record: string,
    appropriation_status: number,
    team: number,
    telemarketer: number,
  ) => {
    const sql = `UPDATE sales_slip SET company_name='${company_name}',
     company_contact_name='${company_contact_name}', 
     loan_amount='${loan_amount}', 
     company_tags='${company_tags}', 
     record='${record}', loan_amount='${loan_amount}', 
     appropriation_status='${appropriation_status}', 
     team='${team}',
     telemarketer='${telemarketer}', 
     update_time=NOW()
     ${company_tags == 1 ? ',loan_amount_time=NOW()' : ''} where id='${id}'`
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
  },
  selectSalesTotal: (team?: number, userId?: number) => {
    let daysql = `SELECT SUM(loan_amount) as daysTotal FROM sales_slip WHERE TO_DAYS(loan_amount_time)=TO_DAYS(NOW())`
    let weeksql = `SELECT SUM(loan_amount) as weekTotal FROM sales_slip WHERE YEARWEEK(DATE_FORMAT(loan_amount_time,'%Y-%m-%d'))=YEARWEEK(NOW())`
    let monthsql = `SELECT SUM(loan_amount) as monthTotal FROM sales_slip  WHERE DATE_FORMAT(loan_amount_time,'%Y%m')=DATE_FORMAT(CURDATE(),'%Y%m')`
    daysql += team
      ? ` AND team='${team}';`
      : userId
      ? ` AND telemarketer='${userId}';`
      : ';'
    weeksql += team
      ? ` AND team='${team}';`
      : userId
      ? ` AND telemarketer='${userId}';`
      : ';'
    monthsql += team
      ? ` AND team='${team}';`
      : userId
      ? ` AND telemarketer='${userId}';`
      : ';'
    const sql = daysql + weeksql + monthsql
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('查询日周月放款金额失败==========》', err)
          reject(err)
        } else {
          Logger.info('查询日周月放款金额成功==========》', result)
          resolve({ ...result[0][0], ...result[1][0], ...result[2][0] })
        }
      })
    })
  },
  selectSalesTotalByTime: (
    startTime: string,
    endTime: string,
    team?: number,
    userId?: number,
  ) => {
    startTime += ' 00:00:00'
    endTime += ' 23:59:59'
    let sql = `SELECT SUM(loan_amount) as total FROM sales_slip WHERE loan_amount_time >= '${startTime}' AND loan_amount_time <= '${endTime}'`
    sql += team
      ? ` AND team='${team}';`
      : userId
      ? ` AND telemarketer='${userId}';`
      : ';'
    console.log('sql=====>', sql)
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('查询日期范围放款金额失败==========》', err)
          reject(err)
        } else {
          Logger.info('查询日期范围放款金额成功==========》', result)
          resolve(result[0])
        }
      })
    })
  },
}
