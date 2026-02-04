import Manager from "../../Models/ManagerModel.js";
import Task from "../../Models/TaskModel.js";
import Employee from "../../Models/EmployeeModel.js";
import dayjs from "dayjs";

export const getAdminDashboard = async (req, res) => {
    try {
        const adminId = req.user.id;
        const todayStart = dayjs().startOf("day").toDate();
        const todayEnd = dayjs().endOf("day").toDate();

        // 🔹 Manager & Employee count
        const managerCount = await Manager.countDocuments({
            adminId,
            isDeleted: false,
        });

        const employeeCount = await Employee.countDocuments({
            adminId,
            isDeleted: false,
        });

        // 🔹 Tasks summary
        const totalTasks = await Task.countDocuments({ adminId });
        const completedTasks = await Task.countDocuments({ adminId, status: "completed" });
        const pendingTasks = await Task.countDocuments({ adminId, status: "pending" });
        const activeTasks = await Task.countDocuments({ adminId, status: "active" });

        const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 🔹 Today's tasks
        const todaysCompleted = await Task.countDocuments({
            adminId,
            status: "completed",
            updatedAt: { $gte: todayStart, $lte: todayEnd },
        });

        const todaysPending = await Task.countDocuments({
            adminId,
            status: "pending",
            updatedAt: { $gte: todayStart, $lte: todayEnd },
        });

        // 🔹 Tasks completed in last 7 days (day-wise)
        const weekStart = dayjs().startOf("week"); // Sunday
        const weekTasks = [];
        for (let i = 0; i < 7; i++) {
            const dayStart = weekStart.add(i, "day").startOf("day").toDate();
            const dayEnd = weekStart.add(i, "day").endOf("day").toDate();

            const completed = await Task.countDocuments({
                adminId,
                status: "completed",
                updatedAt: { $gte: dayStart, $lte: dayEnd },
            });

            weekTasks.push({
                day: dayjs(dayStart).format("dddd"), // Monday, Tuesday...
                completedTasks: completed,
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin dashboard fetched successfully",
            data: {
                managerCount,
                employeeCount,
                totalTasks,
                completedTasks,
                pendingTasks,
                activeTasks,
                taskCompletionPercentage,
                todaysTasks: {
                    completed: todaysCompleted,
                    pending: todaysPending,
                },
                weeklyTasks: weekTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
