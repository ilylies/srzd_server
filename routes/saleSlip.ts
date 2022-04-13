import express from 'express'
import salesSlipDb from '../db/salesSlip'
import teamDb from '../db/team'
import response from '../utils/response'
const router = express.Router()
import { verifyToken } from '../utils/token'
import { sendMsg } from '../utils/wechat'

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
  salesSlipDb
    .selectSalesSlipList(
      page,
      size,
      company_name,
      company_tags,
      appropriation_status,
      team,
      telemarketer,
      userInfo.id,
      userInfo.level,
      teamId,
    )
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

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

router.post('/create', async (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    loan_amount,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer,
  }: any = req.body
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  salesSlipDb
    .createSalesSlip(
      company_name,
      company_contact_name,
      loan_amount,
      company_tags,
      record,
      appropriation_status,
      team,
      telemarketer,
    )
    .then(async (data: any) => {
      sendMsg(
        `${
          userInfo.name
        }新建了销售单：\n企业名称：${company_name}\n企业联系人：${company_contact_name}\n放款金额：${loan_amount}\n企业标签：${
          tags_type[company_tags]
        }\n跟进记录：${
          record ? JSON.parse(record)[0].content : ''
        }\n批款情况：${
          appropriation_type[appropriation_status] || appropriation_status
        }\n所属团队：${team}\n电销员：${telemarketer}`,
      )
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.put('/update/:id', async (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    loan_amount,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer,
  }: any = req.body
  const { id }: any = req.params
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  salesSlipDb
    .updateSalesSlip(
      id,
      company_name,
      company_contact_name,
      loan_amount,
      company_tags,
      record,
      appropriation_status,
      team,
      telemarketer,
    )
    .then(async (data: any) => {
      const recordData = record ? JSON.parse(record) : ''
      sendMsg(
        `${
          userInfo.name
        }修改了销售单：\n企业名称：${company_name}\n企业联系人：${company_contact_name}\n放款金额：${loan_amount}\n企业标签：${
          tags_type[company_tags]
        }\n跟进记录：${
          recordData ? recordData[recordData.length - 1].content : recordData
        }\n批款情况：${
          appropriation_type[appropriation_status] || appropriation_status
        }\n所属团队：${team}\n电销员：${telemarketer}`,
      )
      response.success(res, data)
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
