import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import PlanRouter from "./Routers/PlanRouter.js";
import ManagerRouter from "./Routers/ManagerRouter.js";
import EmployeeRouter from "./Routers/EmployeeRouter.js";
import TaskRouter from "./Routers/TaskRouter.js";
import SubscriptionRouter from "./Routers/SubscriptionRouter.js";
import EventRouter from "./Routers/EventRouter.js";
import NotesRouter from "./Routers/NotesRouter.js";
import DashboardRouter from "./Routers/DashboardRouter.js";
import SalesRouter from "./Routers/SalesRouter.js"



import { subscriptionExpiryCron } from "./Cron/SubscriptionCron.js";

// Start the cron
subscriptionExpiryCron.start();

const router = Router();

router.use("/api/v1/auth", AuthRouter);
router.use("/api/v1/plan", PlanRouter);
router.use("/api/v1/manager", ManagerRouter);
router.use("/api/v1/employee", EmployeeRouter);
router.use("/api/v1/task", TaskRouter);
router.use("/api/v1/subscription", SubscriptionRouter);
router.use("/api/v1/event", EventRouter);
router.use("/api/v1/notes", NotesRouter);
router.use("/api/v1/dashboard", DashboardRouter);
router.use("/api/v1/sales", SalesRouter);


export default router;
