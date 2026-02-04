import Task from "../../Models/TaskModel.js";
import dayjs from "dayjs";

export const getManagerReports = async (req, res) => {
    try {
        const { id } = req.user; // manager id

        // 1️⃣ All manager tasks
        const tasks = await Task.find({
            assignManagerId: id,
            isDeleted: false,
        });

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === "pending").length;
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        const cancelledTasks = tasks.filter(t => t.status === "cancelled").length;
        const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;

        // 2️⃣ Current week range
        const weekStart = dayjs().startOf("week").toDate();
        const weekEnd = dayjs().endOf("week").toDate();

        // 3️⃣ Completed tasks of this week (using updatedAt)
        const weekCompletedTasks = await Task.find({
            assignManagerId: id,
            status: "completed",
            isDeleted: false,
            updatedAt: {
                $gte: weekStart,
                $lte: weekEnd
            }
        });

        // 4️⃣ Day-wise count
        const dayWiseCompleted = {};

        weekCompletedTasks.forEach(task => {
            const day = dayjs(task.updatedAt).format("dddd");
            dayWiseCompleted[day] = (dayWiseCompleted[day] || 0) + 1;
        });

        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const weeklyReport = weekDays.map(day => ({
            day,
            completedTasks: dayWiseCompleted[day] || 0
        }));

        // 5️⃣ Response
        res.status(200).json({
            success: true,
            message: "Manager report fetched successfully",
            data: {
                totalTasks,
                pendingTasks,
                completedTasks,
                cancelledTasks,
                inProgressTasks,
                weeklyCompletedReport: weeklyReport
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};
