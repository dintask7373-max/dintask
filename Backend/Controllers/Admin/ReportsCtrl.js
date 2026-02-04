import Manager from "../../Models/ManagerModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Task from "../../Models/TaskModel.js";

// ================= ADMIN REPORTS =================
export const adminReports = async (req, res) => {
    try {
        const { userId, filterType } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
                data: null
            });
        }

        // Date filter
        let startDate = new Date();

        if (filterType === "last7days") {
            startDate.setDate(startDate.getDate() - 7);
        }
        else if (filterType === "last30days") {
            startDate.setDate(startDate.getDate() - 30);
        }
        else if (filterType === "thisYear") {
            startDate = new Date(new Date().getFullYear(), 0, 1);
        }

        // Check user role
        const manager = await Manager.findById(userId);
        const employee = await Employee.findById(userId);

        if (!manager && !employee) {
            return res.status(404).json({
                success: false,
                message: "User not found in manager or employee",
                data: null
            });
        }

        let filter = {
            isDeleted: false,
            createdAt: { $gte: startDate }
        };

        // Agar employee hai
        if (employee) {
            filter.assignEmployees = userId;
        }

        // Agar manager hai
        if (manager) {
            filter.assignManagerId = userId;
        }

        const totalTasks = await Task.countDocuments(filter);

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "completed"
        });

        const pendingTasks = totalTasks - completedTasks;

        const completionRate =
            totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(2);

        res.status(200).json({
            success: true,
            message: "User Task Report Generated Successfully",
            role: manager ? "manager" : "employee",
            data: {
                totalTasks,
                completedTasks,
                pendingTasks,
                completionRate: `${completionRate}%`
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};
