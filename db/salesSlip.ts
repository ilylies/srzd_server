import mysql from '../utils/mysql'
import { Logger } from '../utils/log4js'

export default {
  selectSalesSlipList: (
    page: number,
    size: number,
    company_name: string,
    company_tags: number,
    team: number,
    telemarketer: number,
    userId: number,
    level: number,
    teamId: number,
  ) => {
    let sql = `select a.*, GROUP_CONCAT(concat(b.appropriation_status, ',', b.amount) SEPARATOR ';') as appropriation from sales_slip as a join loan_situation as b on a.id=b.sid where 1=1 ${
      company_name ? 'and a.company_name="' + company_name + '"' : ''
    } ${company_tags ? 'and a.company_tags="' + company_tags + '"' : ''} ${
      team ? 'and a.team="' + team + '"' : ''
    } ${telemarketer ? 'and a.telemarketer="' + telemarketer + '"' : ''}`

    let sqlCount = `SELECT COUNT(DISTINCT a.id) as totalElements FROM sales_slip as a join loan_situation as b on a.id=b.sid`

    if (level === 2) {
      sql += ` and (a.team='${teamId}' or a.telemarketer='${userId}')`
      sqlCount += ` where (a.team='${teamId}' or a.telemarketer='${userId}')`
    }
    if (level === 3) {
      sql += ` and a.telemarketer='${userId}'`
      sqlCount += ` where a.telemarketer='${userId}'`
    }
    sql += ` group by a.id limit ${(page - 1) * size},${size}`
    Logger.info('销售单列表查询sql==========》', sql)

    Logger.info('销售单列表总数查询sql==========》', sqlCount)
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
          Logger.info('销售单列表总数查询失败==========》', err)
          reject(err)
        } else {
          Logger.info('销售单列表总数查询成功==========》', result)
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
          Logger.info('销售单查询失败==========》', err)
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
    team: number,
    telemarketer: number,
  ) => {
    const sql = `INSERT INTO sales_slip ( company_name, company_contact_name, loan_amount, company_tags, record, team,telemarketer,create_time,loan_amount_time) 
    VALUES  ( '${company_name}', '${company_contact_name}', '${loan_amount}','${company_tags}','${record}','${team}','${telemarketer}', NOW(), ${
      company_tags == 1 ? 'NOW()' : null
    })`
    return new Promise((resolve, reject) => {
      mysql.query(sql, (err, result) => {
        if (err) {
          Logger.info('新建销售单失败==========》', err)
          reject(err)
        } else {
          Logger.info('新建销售单成功==========》', result)
          resolve(result.insertId)
        }
      })
    })
  },
  importSalesSlip: (values: any) => {
    Logger.info('导入数据values==========》', values)
    const sql = `INSERT INTO sales_slip(company_name, company_contact_name, loan_amount, company_tags, team,telemarketer, record, create_time, loan_amount_time) VALUES ?`
    return new Promise((resolve, reject) => {
      mysql.query(sql, [values], (err, result) => {
        if (err) {
          Logger.info('批量导入销售单失败==========》', err)
          reject(err)
        } else {
          Logger.info('批量导入销售单成功==========》', result)
          resolve(result)
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
    team: number,
    telemarketer: number,
  ) => {
    const sql = `UPDATE sales_slip SET company_name='${company_name}',
     company_contact_name='${company_contact_name}', 
     loan_amount='${loan_amount}', 
     company_tags='${company_tags}', 
     record='${record}', loan_amount='${loan_amount}',
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
    let daysql = `SELECT SUM(loan_amount) as daysTotal FROM sales_slip WHERE TO_DAYS(loan_amount_time)=TO_DAYS(NOW()) AND company_tags=1`
    let weeksql = `SELECT SUM(loan_amount) as weekTotal FROM sales_slip WHERE YEARWEEK(DATE_FORMAT(loan_amount_time,'%Y-%m-%d'))=YEARWEEK(NOW()) AND company_tags=1`
    let monthsql = `SELECT SUM(loan_amount) as monthTotal FROM sales_slip  WHERE DATE_FORMAT(loan_amount_time,'%Y%m')=DATE_FORMAT(CURDATE(),'%Y%m') AND company_tags=1`
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
    let sql = `SELECT SUM(loan_amount) as total FROM sales_slip WHERE company_tags=1 AND loan_amount_time >= '${startTime}' AND loan_amount_time <= '${endTime}'`
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
