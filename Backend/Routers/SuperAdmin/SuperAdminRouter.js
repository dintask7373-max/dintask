import express from "express";
import { loginSuperAdmin } from "../../Controllers/SuperAdmin/SuperAdminAuthCtrl.js";
import {
    getAllAdmins,
    getSingleAdmin,
    updateAdmin,
    deleteAdmin,
    changeAdminStatus
} from "../../Controllers/SuperAdmin/AdminManagementCtrl.js";
import upload from "../../Cloudinary/Upload.js";

const router = express.Router();

// Login SuperAdmin
router.post("/login", loginSuperAdmin);

// Admin Management (Currently Unprotected as per original code)
router.get("/getAllAdmins", getAllAdmins);
router.get("/getAdminById/:id", getSingleAdmin);
router.put("/editAdmin/:id", upload.single("avatar"), updateAdmin);
router.delete("/deleteAdmin/:id", deleteAdmin);
router.patch("/changeAdminStatus/:id", changeAdminStatus);

export default router;
