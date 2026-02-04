import express from "express";
import { getAdminDashboard } from "../../Controllers/Admin/AdminDashboardCtrl.js";
import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";
import { checkSubscriptionAccess } from "../../Middlewares/SubscriptionMiddleware.js";

const router = express.Router();

router.get("/admin", AdminMiddleware, isAdmin, checkSubscriptionAccess, getAdminDashboard);

export default router;
