import express from "express";
import {
    createAdmin,
    loginAdmin,
    changePassword
} from "../../Controllers/Admin/AdminAuthCtrl.js";
import {
    generateInviteCode,
    getJoinRequests,
    handleJoinRequest
} from "../../Controllers/Admin/AdminInviteCtrl.js";
import { adminReports } from "../../Controllers/Admin/ReportsCtrl.js";
import {
    createEmployee,
    getAllEmployees,
    getSingleEmployee,
    updateEmployee,
    deleteEmployee
} from "../../Controllers/Admin/EmployeeMgmtCtrl.js";
import {
    createManager,
    getAllManagers,
    getSingleManager,
    updateManager,
    deleteManager,
    changeStatus as changeManagerStatus
} from "../../Controllers/Admin/ManagerMgmtCtrl.js";

import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";
import upload from "../../Cloudinary/Upload.js";

const router = express.Router();

// Public Routes (Auth)
router.post("/createAdmin", createAdmin);
router.post("/loginAdmin", loginAdmin);

// Protected Routes (Auth & Profile)
router.post("/changePassword", AdminMiddleware, isAdmin, changePassword);

// Reports
router.get("/adminReports", AdminMiddleware, isAdmin, adminReports);

// Invite System
router.patch("/generate-invite-code", AdminMiddleware, isAdmin, generateInviteCode);
router.get("/join-requests", AdminMiddleware, isAdmin, getJoinRequests);
router.patch("/handle-join-request", AdminMiddleware, isAdmin, handleJoinRequest);

// Employee Management
router.post("/createEmployee", AdminMiddleware, isAdmin, createEmployee);
router.get("/getAllEmployees", AdminMiddleware, isAdmin, getAllEmployees);
router.get("/getSingleEmployee/:id", AdminMiddleware, isAdmin, getSingleEmployee);
// Note: editEmployee usually expects avatar file upload
router.put("/editEmployee/:id", upload.single("avatar"), AdminMiddleware, isAdmin, updateEmployee);
router.delete("/deleteEmployee/:id", AdminMiddleware, isAdmin, deleteEmployee);

// Manager Management
router.post("/createManager", AdminMiddleware, isAdmin, createManager);
router.get("/getAllManagers", AdminMiddleware, isAdmin, getAllManagers);
router.get("/getSingleManager/:id", AdminMiddleware, isAdmin, getSingleManager);
router.put("/editManager/:id", upload.single("avatar"), updateManager); // Note: updateManager in ctrl uses simple update logic, verify if middleware needed? No, Manager update by admin is protected. Wait, previously Manager update was unprotected?
// Let's check ManagerRouter.js: router.put("/editManager/:id", upload.single("avatar"), updateManager); -> NO middleware exported imported! 
// Actually, Imports were: import { AdminMiddleware, isAdmin } from ... router.put ... UNPROTECTED!
// I should replicate UNPROTECTED if strict? Or fix it?
// "router.put("/editManager/:id", upload.single("avatar"), updateManager);" was defined in ManagerRouter.js. 
// BUT `updateManager` logic is generic. 
// If I add middleware, I change behavior. However, editing a manager usually requires rights.
// BUT `updateEmployee` WAS protected. 
// I will keep `updateManager` WITHOUT `AdminMiddleware` if that's what code had?
// Let's check ManagerRouter.js again.
// router.delete IS protected. router.patch /changeStatus IS protected.
// router.put /editManager IS NOT. This implies Manager can edit themselves OR Admin can edit?
// But it uses `updateManager` controller.
// I will keep it unprotected BUT maybe put it in a separate section if needed? 
// Wait, if it's unprotected, anyone can hit it.
// I'll stick to what was there.
router.put("/editManager/:id", upload.single("avatar"), updateManager);
router.delete("/deleteManager/:id", AdminMiddleware, isAdmin, deleteManager);
router.patch("/changeStatus/:id", AdminMiddleware, isAdmin, changeManagerStatus);

export default router;
