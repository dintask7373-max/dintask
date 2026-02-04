import express from "express";
import {
  getAdminDashboard,
  getSuperadminDashboard,
  managerDashboard,
} from "../Controllers/DashboardCtrl.js";

import { AdminMiddleware, isAdmin } from "../Middlewares/AdminMiddleware.js";
import {
  ManagerMiddleware,
  isManager,
} from "../Middlewares/ManagerMiddleware.js";
import { checkSubscriptionAccess } from "../Middlewares/SubscriptionMiddleware.js";

const router = express.Router();

router.get("/admin", AdminMiddleware, isAdmin, checkSubscriptionAccess, getAdminDashboard);
router.get("/superadmin", getSuperadminDashboard);
router.get("/manager", ManagerMiddleware, isManager, checkSubscriptionAccess, managerDashboard);

export default router;
