import express from 'express'
import salesSlipDb from '../db/salesSlip'
import teamDb from '../db/team'
import userDb from '../db/user'
import loanSituationDb from '../db/loanSituation'
import response from '../utils/response'
const router = express.Router()
import { verifyToken } from '../utils/token'
import { sendMsg } from '../utils/wechat'
import { Logger } from '../utils/log4js'

const tags_type: any = {
  1: '已放款',
  2: '已拜访',
  3: '短期办不了',
  4: '待跟进',
  5: '已办理拒绝',
  6: '可以继续办理',
  7: '办理中',
}
const appropriation_type: any = {
  1: '建行',
  2: '邮政',
  3: '交行',
  4: '广发',
  5: '微众',
  6: '苏宁',
  7: '金城',
  8: '网商',
}
/* GET salesSlip listing. */

router.get('/list', async (req, res, next) => {
  const {
    page,
    size,
    company_name,
    company_tags,
    appropriation_status,
    team,
    telemarketer,
  }: any = req.query
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  let teamId: number = 0
  if (userInfo.level === 2) {
    const teamData: any = await teamDb.selectTeamByCaptain(userInfo.id)
    teamId = teamData ? teamData.id : 0
  }
  await salesSlipDb
    .selectSalesSlipList(
      page,
      size,
      company_name,
      company_tags,
      team,
      telemarketer,
      userInfo.id,
      userInfo.level,
      teamId,
    )
    .then(async (data: any) => {
      data.content.forEach((i) => {
        i.appropriation = i.appropriation.split(';').map((item) => {
          const arr = item.split(',')
          return {
            appropriation_status: Number(arr[0]),
            amount: Number(arr[1]),
          }
        })
      })
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.post('/create', async (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer,
  }: any = req.body
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  const loan_amount = appropriation_status
    .map((i) => i.amount)
    .reduce(function (p1, p2) {
      return p1 + p2
    })
  salesSlipDb
    .createSalesSlip(
      company_name,
      company_contact_name,
      loan_amount,
      company_tags,
      record,
      team,
      telemarketer,
    )
    .then(async (insertId: any) => {
      const data = appropriation_status.map((item) => {
        const arr = []
        Object.keys(item).forEach((i) => {
          arr.push(item[i])
        })
        arr.push(insertId, new Date())
        return arr
      })
      await loanSituationDb.create(data)
      response.success(res, true)
      const telemarketerInfo: any = await userDb.selectUsersById(telemarketer)
      const teamInfo: any = await teamDb.selectTeamById(team)
      sendMsg(
        `${
          userInfo.name
        }新建了销售单：\n企业名称：${company_name}\n企业联系人：${company_contact_name}\n放款金额：${loan_amount}\n企业标签：${
          tags_type[company_tags]
        }\n跟进记录：${
          record ? JSON.parse(record)[0].content : ''
        }\n所属团队：${teamInfo.name}\n电销员：${telemarketerInfo.name}`,
      )
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.post('/importSalesSlip', async (req, res, next) => {
  const { importedData }: any = req.body
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  const formatterData = importedData.map((item: any) => {
    item.create_time = new Date()
    if (item.company_tags == 1) {
      item.loan_amount_time = new Date()
    } else {
      item.loan_amount_time = null
    }
    const arr: any[] = []
    const obj: any = {}
    const keySortKey = [
      'company_name',
      'company_contact_name',
      'loan_amount',
      'company_tags',
      'team',
      'telemarketer',
      'record',
      'create_time',
      'loan_amount_time',
    ]
    keySortKey.forEach((i) => {
      obj[i] = item[i]
      arr.push(obj[i])
    })
    return arr
  })

  salesSlipDb
    .importSalesSlip(formatterData)
    .then(async (result: any) => {
      const insertIdArr = [result.insertId]
      for (let i = 1; i <= result.affectedRows; i++) {
        insertIdArr.push(result.insertId + i)
      }
      const data  = []
      importedData.forEach((i,index)=>{
        i.appropriation_status.forEach((item) => {
          const arr = []
          Object.keys(item).forEach((k) => {
            arr.push(item[k])
          })
          arr.push(insertIdArr[index], new Date())
          data.push(arr)
        })
      })
      await loanSituationDb.create(data)
      sendMsg(`${userInfo.name}批量导入了${formatterData.length}条销售单`)
      response.success(res, true)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.put('/update/:id', async (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer,
  }: any = req.body
  const { id }: any = req.params
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  const loan_amount = appropriation_status
    .map((i) => i.amount)
    .reduce(function (p1, p2) {
      return p1 + p2
    })
  salesSlipDb
    .updateSalesSlip(
      id,
      company_name,
      company_contact_name,
      loan_amount,
      company_tags,
      record,
      team,
      telemarketer,
    )
    .then(async (result: any) => {
      const data = appropriation_status.map((item) => {
        const obj = {
          appropriation_status: Number(item.appropriation_status),
          amount: Number(item.amount),
        }
        const arr = []
        Object.keys(obj).forEach((i) => {
          arr.push(obj[i])
        })
        arr.push(id, new Date())
        return arr
      })
      await loanSituationDb.deleteBySid(id)
      await loanSituationDb.create(data)
      response.success(res, true)
      const recordData = record ? JSON.parse(record) : ''
      const telemarketerInfo: any = await userDb.selectUsersById(telemarketer)
      const teamInfo: any = await teamDb.selectTeamById(team)
      sendMsg(
        `${
          userInfo.name
        }修改了销售单：\n企业名称：${company_name}\n企业联系人：${company_contact_name}\n放款金额：${loan_amount}\n企业标签：${
          tags_type[company_tags]
        }\n跟进记录：${
          recordData ? recordData[recordData.length - 1].content : recordData
        }\n批款情况：${
          appropriation_type[appropriation_status] || appropriation_status
        }\n所属团队：${teamInfo.name}\n电销员：${telemarketerInfo.name}`,
      )
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.delete('/delete/:id', async (req, res, next) => {
  const { id }: any = req.params
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  salesSlipDb
    .deteleSalesSlip(id)
    .then(async (data: any) => {
      sendMsg(`${userInfo.name}删除了销售单：${id}`)
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.get('/selectSalesTotal', (req, res, next) => {
  const { team, userId }: any = req.query
  salesSlipDb
    .selectSalesTotal(team, userId)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.get('/selectSalesTotalByTime', (req, res, next) => {
  const { startTime, endTime, team, userId }: any = req.query
  salesSlipDb
    .selectSalesTotalByTime(startTime, endTime, team, userId)
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

export default router
