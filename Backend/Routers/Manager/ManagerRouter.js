import express from "express";
import {
    createManager,
    getAllManagers,
    getSingleManager,
    updateManager,
    deleteManager,
    changeStatus
} from "../../Controllers/Admin/ManagerMgmtCtrl.js";

import {
    loginManager,
    changePassword,
    joinWorkspace
} from "../../Controllers/Manager/AuthCtrl.js";

import { teamMembers, getTeamProgressData } from "../../Controllers/Manager/TaskCtrl.js";
import { getManagerReports } from "../../Controllers/Manager/ReportCtrl.js";

import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";
import { ManagerMiddleware, isManager } from "../../Middlewares/ManagerMiddleware.js";
import upload from "../../Cloudinary/Upload.js";

const router = express.Router();

// CRUD (Admin Actions)
router.post("/createManager", AdminMiddleware, isAdmin, createManager);
router.get("/getAllManagers", AdminMiddleware, isAdmin, getAllManagers);
router.get("/getSingleManager/:id", AdminMiddleware, isAdmin, getSingleManager);
router.put("/editManager/:id", upload.single("avatar"), updateManager);
router.delete("/deleteManager/:id", AdminMiddleware, isAdmin, deleteManager);
router.patch("/changeStatus/:id", AdminMiddleware, isAdmin, changeStatus);

// Auth (Manager Actions)
router.post("/loginManager", loginManager);
router.post("/changePassword", ManagerMiddleware, isManager, changePassword);
router.post("/join-workspace", ManagerMiddleware, joinWorkspace);

// Team & Reports
router.get("/teamMembers", ManagerMiddleware, isManager, teamMembers);
router.get("/teamProgress", ManagerMiddleware, isManager, getTeamProgressData);
router.get("/managerReports", ManagerMiddleware, isManager, getManagerReports);

export default router;
