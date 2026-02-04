import express from "express";
const router = express.Router();
import {
    registerSalesUser,
    loginSalesUser,
    createSale,
    getDashboardStats,
    getRecentActivity,
    getTargetsData,
    getPerformanceChart
} from "../Controllers/SalesCtrl.js";
import { joinWorkspace } from "../Controllers/AuthCtrl.js";

// Import Middleware
import { authSalesUser } from '../Middlewares/SalesMiddleware.js';

// Public Routes
router.post('/register', registerSalesUser);
router.post('/login', loginSalesUser);

// Protected Routes
router.use(authSalesUser); // Apply auth to all subsequent routes

router.post('/create', createSale);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/targets', getTargetsData); // New: Set Targets
router.get("/performance", getPerformanceChart);
router.post("/join-workspace", authSalesUser, joinWorkspace);

export default router;
