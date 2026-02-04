import express from "express";
import {
  loginSuperAdmin,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  changeAdminStatus,
  loginAdmin,
  getSingleAdmin,
  changePassword,

  adminReports,
  generateInviteCode,
  getJoinRequests,
  handleJoinRequest,

} from "../Controllers/AuthCtrl.js";


const router = express.Router();
import { AdminMiddleware, isAdmin } from "../Middlewares/AdminMiddleware.js";
import upload from "../Cloudinary/Upload.js";

// Login SuperAdmin
router.post("/login", loginSuperAdmin);

router.post("/createAdmin", createAdmin);
router.get("/getAllAdmins", getAllAdmins);
router.get("/getAdminById/:id", getSingleAdmin);
router.put("/editAdmin/:id", upload.single("avatar"), updateAdmin);
router.delete("/deleteAdmin/:id", deleteAdmin);

// Status
router.patch("/changeAdminStatus/:id", changeAdminStatus);

// Auth
router.post("/loginAdmin", loginAdmin);
router.post("/changePassword", AdminMiddleware, isAdmin, changePassword);
router.get("/adminReports", AdminMiddleware, isAdmin, adminReports);

// Invite System
// Invite System
router.patch("/generate-invite-code", AdminMiddleware, isAdmin, generateInviteCode);
router.get("/join-requests", AdminMiddleware, isAdmin, getJoinRequests);
router.patch("/handle-join-request", AdminMiddleware, isAdmin, handleJoinRequest);

export default router;
