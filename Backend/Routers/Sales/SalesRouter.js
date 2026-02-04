import express from "express";
import {
    registerSalesUser,
    loginSalesUser,
    joinWorkspace
} from "../../Controllers/Sales/SalesAuthCtrl.js";
import {
    createSale,
    getRecentActivity
} from "../../Controllers/Sales/SalesDealCtrl.js";
import {
    getDashboardStats,
    getTargetsData,
    getPerformanceChart
} from "../../Controllers/Sales/SalesDashboardCtrl.js";

import { authSalesUser } from '../../Middlewares/SalesMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerSalesUser);
router.post('/login', loginSalesUser);

// Protected Routes
router.use(authSalesUser); // Apply auth to all subsequent routes

router.post('/create', createSale);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/targets', getTargetsData);
router.get("/performance", getPerformanceChart);
router.post("/join-workspace", joinWorkspace); // authSalesUser is already applied via router.use

export default router;
