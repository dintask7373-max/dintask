import express from "express";
import {
    createEmployee,
    getAllEmployees,
    getSingleEmployee,
    updateEmployee,
    deleteEmployee
} from "../../Controllers/Admin/EmployeeMgmtCtrl.js";

import {
    loginEmployee,
    changePassword,
    joinWorkspace
} from "../../Controllers/Employee/AuthCtrl.js";

import { changeStatus } from "../../Controllers/Employee/ProfileCtrl.js";
import { getEmployeeTask } from "../../Controllers/Employee/TaskCtrl.js";

import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";
import { EmployeeMiddleware, isEmployee } from "../../Middlewares/EmployeeMiddleware.js";
import upload from "../../Cloudinary/Upload.js";

const router = express.Router();

// CRUD (Admin Actions)
router.post("/createEmployee", AdminMiddleware, isAdmin, createEmployee);
router.get("/getAllEmployees", AdminMiddleware, isAdmin, getAllEmployees);
router.get("/getSingleEmployee/:id", AdminMiddleware, isAdmin, getSingleEmployee);
router.put("/editEmployee/:id", upload.single("avatar"), AdminMiddleware, isAdmin, updateEmployee);
router.delete("/deleteEmployee/:id", AdminMiddleware, isAdmin, deleteEmployee);

// Auth (Employee Actions)
router.post("/loginEmployee", loginEmployee);
router.post("/changePassword", EmployeeMiddleware, isEmployee, changePassword);
router.post("/changeStatus", EmployeeMiddleware, isEmployee, changeStatus);
router.get("/getEmployeeTask", EmployeeMiddleware, isEmployee, getEmployeeTask);
router.post("/join-workspace", EmployeeMiddleware, joinWorkspace);

export default router;
