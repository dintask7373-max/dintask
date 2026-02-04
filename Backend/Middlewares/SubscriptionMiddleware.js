import asyncHandler from "express-async-handler";
import Admin from "../Models/AdminModel.js";
import Subscription from "../Models/SubscriptionModel.js";

export const checkSubscriptionAccess = asyncHandler(async (req, res, next) => {
    // 1. Identify the Admin ID (Account Owner)
    let adminId;

    console.log("🔍 Subscription Check Started");
    console.log("User Role:", req.user?.role);
    console.log("User ID:", req.user?._id);

    if (req.user.role === 'admin') {
        adminId = req.user._id;
    } else if (req.user.adminId) {
        // Employees/Managers usually have adminId
        adminId = req.user.adminId;
    } else if (req.user.managerId) {
        // Sales Users might have managerId, need to find Admin from Manager
        // This requires a population or extra query if not available in req.user
        // Assuming populated or we request it.
        // For simplicity, let's look up the Manager to find the Admin
        const Manager = (await import("../Models/ManagerModel.js")).default;
        const manager = await Manager.findById(req.user.managerId);
        if (manager && manager.adminId) {
            adminId = manager.adminId;
        }
    }

    if (!adminId) {
        console.log("❌ Could not determine Admin ID");
        // Check if we should block or allow? defaulting to log and allow for now to avoid breaking unrelated flows
        return next();
    }

    console.log("✅ Admin ID Determined:", adminId);

    // 2. Fetch Admin to check registration date
    const admin = await Admin.findById(adminId);
    if (!admin) {
        res.status(404);
        throw new Error("Company Account (Admin) not found");
    }

    // 3. Check Trial Period (7 Days) - CURRENTLY OVERRIDDEN TO 1 MINUTE
    const sevenDaysInMillis = 1 * 60 * 1000;
    const timeSinceRegistration = Date.now() - new Date(admin.createdAt).getTime();

    console.log("🕒 Time Since Reg (ms):", timeSinceRegistration);
    console.log("🕒 Threshold (ms):", sevenDaysInMillis);

    if (timeSinceRegistration <= sevenDaysInMillis) {
        console.log("✅ Still in Trial Period");
        // Inside Trial Period
        return next();
    }

    console.log("⚠️ Trial Expired. Checking Subscription...");

    // 4. Check Active Subscription
    const activeSub = await Subscription.findOne({
        adminId: admin._id,
        status: 'active', // Should be 'active'
        isDeleted: false
    });

    if (activeSub) {
        console.log("✅ Active Subscription Found:", activeSub._id);
        // Has active subscription
        return next();
    }

    console.log("❌ No Active Subscription. Access Denied.");

    // 5. Block Access
    res.status(403).json({
        message: "Your free trial has expired. Please upgrade your subscription to continue accessing the dashboard."
    });
});
