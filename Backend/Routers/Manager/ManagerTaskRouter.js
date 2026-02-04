import express from "express";
import {
    getManagerTasks,
    getManagerAllTasks
} from "../../Controllers/Manager/TaskCtrl.js";
import { ManagerMiddleware, isManager } from "../../Middlewares/ManagerMiddleware.js";

const router = express.Router();

router.get("/managerTasks", ManagerMiddleware, isManager, getManagerTasks);
router.get("/managerAllTasks", ManagerMiddleware, isManager, getManagerAllTasks);

export default router;
