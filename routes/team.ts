import express from "express";
import teamDb from "../db/team";
import response from "../utils/response";
import { verifyToken } from '../utils/token'
import { sendMsg } from '../utils/wechat'
const router = express.Router();

/* GET team listing. */

router.get("/list", (req, res, next) => {
  const { page, size, name }: any = req.query;
  teamDb
    .selectTeamList(page, size, name)
    .then(async (data: any) => {
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});

router.post("/create", async (req, res, next) => {
  const { name, captain, members }: any = req.body;
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  teamDb
    .createTeam(name, captain, members)
    .then(async (data: any) => {
      sendMsg(`${userInfo.name}新建了团队：${name}`)
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});
router.put("/update/:id", async (req, res, next) => {
  const { name, captain, members }: any = req.body;
  const { id }: any = req.params;
  const token: any = req.headers.authorization
  const userInfo: any = await verifyToken(token)
  teamDb
    .updateTeam(id, name, captain, members)
    .then(async (data: any) => {
      sendMsg(`${userInfo.name}修改了团队信息：${name}`)
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});
router.delete("/delete/:id", (req, res, next) => {
  const { id }: any = req.params;
  teamDb
    .deteleTeam(id)
    .then(async (data: any) => {
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});

export default router;
