import express from "express";
import { getSuperadminDashboard } from "../../Controllers/SuperAdmin/SuperAdminDashboardCtrl.js";

const router = express.Router();

router.get("/superadmin", getSuperadminDashboard);

export default router;
