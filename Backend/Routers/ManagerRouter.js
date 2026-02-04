import express from "express";
import {
  createManager,
  getAllManagers,
  getSingleManager,
  updateManager,
  deleteManager,
  changeStatus,
  loginManager,
  changePassword,
  teamMembers,
  getTeamProgressData,
  getManagerReports,
} from "../Controllers/ManagerCtrl.js";
import { joinWorkspace } from "../Controllers/AuthCtrl.js";

const router = express.Router();

import upload from "../Cloudinary/Upload.js";

import { AdminMiddleware, isAdmin } from "../Middlewares/AdminMiddleware.js";
import { ManagerMiddleware, isManager } from "../Middlewares/ManagerMiddleware.js";

router.post("/createManager", AdminMiddleware, isAdmin, createManager);
router.get("/getAllManagers", AdminMiddleware, isAdmin, getAllManagers);
router.get("/getSingleManager/:id", AdminMiddleware, isAdmin, getSingleManager);
router.put("/editManager/:id", upload.single("avatar"), updateManager);
router.delete("/deleteManager/:id", AdminMiddleware, isAdmin, deleteManager);
router.patch("/changeStatus/:id", AdminMiddleware, isAdmin, changeStatus);
router.post("/loginManager", loginManager);
router.post("/changePassword", ManagerMiddleware, isManager, changePassword);
router.get("/teamMembers", ManagerMiddleware, isManager, teamMembers);
router.get("/teamProgress", ManagerMiddleware, isManager, getTeamProgressData);
router.get("/managerReports", ManagerMiddleware, isManager, getManagerReports);
router.post("/join-workspace", ManagerMiddleware, joinWorkspace);

export default router;
