import express from "express";
import { getEmployeeEvents } from "../../Controllers/Employee/EventCtrl.js";
import { EmployeeMiddleware, isEmployee } from "../../Middlewares/EmployeeMiddleware.js";

const router = express.Router();

router.get("/getEmployeeEvents", EmployeeMiddleware, isEmployee, getEmployeeEvents);

export default router;
