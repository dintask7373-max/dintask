import express from "express";
import { managerDashboard } from "../../Controllers/Manager/ManagerDashboardCtrl.js";
import { ManagerMiddleware, isManager } from "../../Middlewares/ManagerMiddleware.js";
import { checkSubscriptionAccess } from "../../Middlewares/SubscriptionMiddleware.js";

const router = express.Router();

router.get("/manager", ManagerMiddleware, isManager, checkSubscriptionAccess, managerDashboard);

export default router;
