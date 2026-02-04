import Subscription from "../../Models/SubscriptionModel.js";
import Manager from "../../Models/ManagerModel.js";
import Admin from "../../Models/AdminModel.js";
import Task from "../../Models/TaskModel.js";
import Plan from "../../Models/PlanModel.js";

export const getSuperadminDashboard = async (req, res) => {
    try {
        // 🔹 Total admins
        const totalAdmins = await Admin.countDocuments({ isDeleted: false });

        // 🔹 Total active subscriptions
        const totalActiveSubscriptions = await Subscription.countDocuments({
            status: "active",
            isDeleted: false,
        });

        // 🔹 Total managers
        const totalManagers = await Manager.countDocuments({ isDeleted: false });

        // 🔹 Plan wise revenue & admin count (include all plans)
        const allPlans = await Plan.find({ isDeleted: false }).lean();

        const planRevenueAgg = await Promise.all(
            allPlans.map(async (plan) => {
                const activeSubs = await Subscription.find({
                    planId: plan._id,
                    status: "active",
                    isDeleted: false,
                });

                const totalRevenue = activeSubs.reduce(
                    (sum, sub) => sum + (sub.finalPayableAmount || 0),
                    0,
                );

                const adminCount = activeSubs.length;

                return {
                    _id: plan._id,
                    planName: plan.planName,
                    planPrice: plan.planPrice,
                    planTier: plan.planTier,
                    totalRevenue,
                    adminCount,
                };
            }),
        );

        // 🔹 Recent 5 companies
        const recentAdmins = await Admin.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentCompanies = await Promise.all(
            recentAdmins.map(async (admin) => {
                const activeSub = await Subscription.findOne({
                    adminId: admin._id,
                    status: "active",
                    isDeleted: false,
                }).populate("planId");

                // Total tasks & completed tasks for this admin
                const totalTasks = await Task.countDocuments({ adminId: admin._id });
                const completedTasks = await Task.countDocuments({
                    adminId: admin._id,
                    status: "completed",
                });

                const taskCompletionPercentage =
                    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return {
                    companyName: admin.companyName,
                    ownerName: admin.ownerName,
                    currentPlan: activeSub?.planId?.planName || "No Active Plan",
                    joinedAt: admin.createdAt,
                    status: activeSub?.status || "No Active Plan",
                    totalTasks,
                    taskCompletionPercentage,
                };
            }),
        );

        // 🔹 All tasks summary across all admins
        const totalTasksAll = await Task.countDocuments({});
        const completedTasksAll = await Task.countDocuments({
            status: "completed",
        });
        const taskCompletionAll =
            totalTasksAll > 0
                ? Math.round((completedTasksAll / totalTasksAll) * 100)
                : 0;

        res.status(200).json({
            success: true,
            message: "Superadmin dashboard fetched successfully",
            data: {
                totalAdmins,
                totalActiveSubscriptions,
                totalManagers,
                allTasksSummary: {
                    totalTasksAll,
                    completedTasksAll,
                    taskCompletionAll,
                },
                planRevenueAgg,
                recentCompanies,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
