import { Response } from 'express'
export default {
  success: (res: Response, payload: any = '') => {
    const response = {
      code: 200,
      payload,
    }
    res.status(200).send(response)
  },
  fail: (res: Response, message: any,code: number = 500) =>{
    const response = {
      code,
      message,
    }
    res.status(500).send(response)
  }
}
