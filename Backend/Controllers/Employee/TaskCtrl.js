import Employee from "../../Models/EmployeeModel.js";
import Task from "../../Models/TaskModel.js";
import dayjs from "dayjs";

export const getEmployeeTask = async (req, res) => {
    try {
        const { id } = req.user;  // employee id

        // Check employee
        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        // Get all tasks of this employee
        const tasks = await Task.find({
            assignEmployees: id,
            isDeleted: false
        })
            .populate("assignManagerId", "fullName email")
            .populate("adminId", "ownerName email")
            .sort({ createdAt: -1 });

        // Count & filter
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "completed");
        const pendingTasks = tasks.filter(t => t.status === "pending");

        // Today tasks
        const todayStart = dayjs().startOf("day").toDate();
        const todayEnd = dayjs().endOf("day").toDate();

        const todayTasks = tasks.filter(task => {
            return task.deadline >= todayStart && task.deadline <= todayEnd;
        });

        res.status(200).json({
            success: true,
            message: "Employee tasks fetched successfully",
            data: {
                totalTasks,
                completedTaskCount: completedTasks.length,
                pendingTaskCount: pendingTasks.length,
                completedTasks,
                pendingTasks,
                todayTasks
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

export const getEmployeeTasks = async (req, res) => {
    try {
        const { id } = req.user; // employee id

        const tasks = await Task.find({
            assignEmployees: id,
            isDeleted: false,
        }).populate("assignManagerId", "fullName email");

        res.status(200).json({
            success: true,
            message: "My tasks fetched successfully",
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};
