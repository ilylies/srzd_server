import express from 'express'
import salesSlipDb from '../db/salesSlip'
import response from '../utils/response'
const router = express.Router()

/* GET salesSlip listing. */

router.get('/list', (req, res, next) => {
  const {
    page,
    size,
    company_name,
    company_tags,
    appropriation_status,
    team,
    telemarketer
  }: any = req.query
  salesSlipDb
    .selectSalesSlipList(
      page,
      size,
      company_name,
      company_tags,
      appropriation_status,
      team,
      telemarketer
    )
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})

router.post('/create', (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    loan_amount,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer
  }: any = req.body
  salesSlipDb
    .createSalesSlip(
      company_name,
      company_contact_name,
      loan_amount,
      company_tags,
      record,
      appropriation_status,
      team,
      telemarketer
    )
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.put('/update/:id', (req, res, next) => {
  const {
    company_name,
    company_contact_name,
    loan_amount,
    company_tags,
    record,
    appropriation_status,
    team,
    telemarketer
  }: any = req.body
  const { id }: any = req.params
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
      telemarketer
    )
    .then(async (data: any) => {
      response.success(res, data)
    })
    .catch((err) => {
      response.fail(res, err)
    })
})
router.delete('/delete/:id', (req, res, next) => {
  const { id }: any = req.params
  salesSlipDb
    .deteleSalesSlip(id)
    .then(async (data: any) => {
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
