import { Router } from "express";

import SuperAdminRouter from "./Routers/SuperAdmin/SuperAdminRouter.js";
import AdminRouter from "./Routers/Admin/AdminRouter.js";
import PlanRouter from "./Routers/PlanRouter.js";
import ManagerRouter from "./Routers/Manager/ManagerRouter.js";
import EmployeeRouter from "./Routers/Employee/EmployeeRouter.js";
import AdminTaskRouter from "./Routers/Admin/AdminTaskRouter.js";
import ManagerTaskRouter from "./Routers/Manager/ManagerTaskRouter.js";
import EmployeeTaskRouter from "./Routers/Employee/EmployeeTaskRouter.js";
// import TaskRouter from "./Routers/TaskRouter.js"; // Legacy

import SubscriptionRouter from "./Routers/SubscriptionRouter.js";

import AdminEventRouter from "./Routers/Admin/AdminEventRouter.js";
import ManagerEventRouter from "./Routers/Manager/ManagerEventRouter.js";
import EmployeeEventRouter from "./Routers/Employee/EmployeeEventRouter.js";
// import EventRouter from "./Routers/EventRouter.js"; // Legacy

import EmployeeNotesRouter from "./Routers/Employee/EmployeeNotesRouter.js";
// import NotesRouter from "./Routers/NotesRouter.js"; // Legacy

import SuperAdminDashboardRouter from "./Routers/SuperAdmin/SuperAdminDashboardRouter.js";
import AdminDashboardRouter from "./Routers/Admin/AdminDashboardRouter.js";
import ManagerDashboardRouter from "./Routers/Manager/ManagerDashboardRouter.js";
// import DashboardRouter from "./Routers/DashboardRouter.js"; // Legacy

import SalesRouter from "./Routers/Sales/SalesRouter.js";



import { subscriptionExpiryCron } from "./Cron/SubscriptionCron.js";

// Start the cron
subscriptionExpiryCron.start();

const router = Router();

// Mounted multiple routers to auth to preserve existing endpoints
router.use("/api/v1/auth", SuperAdminRouter);
router.use("/api/v1/auth", AdminRouter);

router.use("/api/v1/plan", PlanRouter);
router.use("/api/v1/manager", ManagerRouter);
router.use("/api/v1/employee", EmployeeRouter);

// Task Routes (Split)
router.use("/api/v1/task", AdminTaskRouter);
router.use("/api/v1/task", ManagerTaskRouter);
router.use("/api/v1/task", EmployeeTaskRouter);

router.use("/api/v1/subscription", SubscriptionRouter);

// Event Routes (Split)
router.use("/api/v1/event", AdminEventRouter);
router.use("/api/v1/event", ManagerEventRouter);
router.use("/api/v1/event", EmployeeEventRouter);

router.use("/api/v1/notes", EmployeeNotesRouter);

// Dashboard Routes (Split)
router.use("/api/v1/dashboard", SuperAdminDashboardRouter);
router.use("/api/v1/dashboard", AdminDashboardRouter);
router.use("/api/v1/dashboard", ManagerDashboardRouter);

router.use("/api/v1/sales", SalesRouter);


export default router;
