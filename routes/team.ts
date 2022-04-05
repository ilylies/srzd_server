import express from "express";
import teamDb from "../db/team";
import response from "../utils/response";
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

router.post("/create", (req, res, next) => {
  const { name, captain, members }: any = req.body;
  teamDb
    .createTeam(name, captain, members)
    .then(async (data: any) => {
      response.success(res, data);
    })
    .catch((err) => {
      response.fail(res, err);
    });
});
router.put("/update/:id", (req, res, next) => {
  const { name, captain, members }: any = req.body;
  const { id }: any = req.params;
  teamDb
    .updateTeam(id, name, captain, members)
    .then(async (data: any) => {
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
