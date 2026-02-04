import express from "express";
import { getManagerEvents } from "../../Controllers/Manager/EventCtrl.js";
import { ManagerMiddleware, isManager } from "../../Middlewares/ManagerMiddleware.js";

const router = express.Router();

router.get("/getManagerEvents", ManagerMiddleware, isManager, getManagerEvents);

export default router;
