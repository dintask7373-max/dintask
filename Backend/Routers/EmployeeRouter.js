import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  changePassword,
  changeStatus,
  getEmployeeTask
} from "../Controllers/EmployeeCtrl.js";
import { joinWorkspace } from "../Controllers/AuthCtrl.js";

import { AdminMiddleware, isAdmin } from "../Middlewares/AdminMiddleware.js";
import { EmployeeMiddleware, isEmployee } from "../Middlewares/EmployeeMiddleware.js";

const router = express.Router();
import upload from "../Cloudinary/Upload.js";

// CRUD
router.post("/createEmployee", AdminMiddleware, isAdmin, createEmployee);
router.get("/getAllEmployees", AdminMiddleware, isAdmin, getAllEmployees);
router.get("/getSingleEmployee/:id", AdminMiddleware, isAdmin, getSingleEmployee);
router.put("/editEmployee/:id", upload.single("avatar"), AdminMiddleware, isAdmin, updateEmployee);
router.delete("/deleteEmployee/:id", AdminMiddleware, isAdmin, deleteEmployee);

// Auth
router.post("/loginEmployee", loginEmployee);
router.post("/changePassword", EmployeeMiddleware, isEmployee, changePassword);
router.post("/changeStatus", EmployeeMiddleware, isEmployee, changeStatus);
router.get("/getEmployeeTask", EmployeeMiddleware, isEmployee, getEmployeeTask);
router.post("/join-workspace", EmployeeMiddleware, joinWorkspace);

export default router;
