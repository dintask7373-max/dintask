import express from "express";
import {
    getEmployeeTasks,
    getEmployeeTask
} from "../../Controllers/Employee/TaskCtrl.js";
import { EmployeeMiddleware, isEmployee } from "../../Middlewares/EmployeeMiddleware.js";

const router = express.Router();

router.get("/employeeTasks", EmployeeMiddleware, isEmployee, getEmployeeTasks);
// This route below (getEmployeeTask) was probably from my initial refactor or separate request.
// The original router only had 'employeeTasks'.
// But I'll include 'getEmployeeTask' if the user needs the detailed statistics one, maybe on a new route?
// Or just let 'employeeTasks' handle the list as before.
// I will keep existing behavior.
// But wait, the `getEmployeeTask` controller I saw had similar logic but with stats.
// Let's expose both if needed, but for now map 'employeeTasks' to 'getEmployeeTasks' (List) 
// to ensure exact compatibility.
// If I want to expose the stats one, I can map it to '/stats' or something.
// For now, I'll just map what was in the original router.

export default router;
