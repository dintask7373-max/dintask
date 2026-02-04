import Employee from "../../Models/EmployeeModel.js";
import Task from "../../Models/TaskModel.js";

export const teamMembers = async (req, res) => {
    try {
        const { id } = req.user; // manager id

        // 1️⃣ Get team members
        const teamMembers = await Employee.find({
            assignManagerId: id,
            isDeleted: false
        }).select("fullName email avatar role roleName isActive");

        const teamWithTasks = await Promise.all(
            teamMembers.map(async (member) => {

                // 2️⃣ Get tasks of this employee
                const tasks = await Task.find({
                    assignEmployees: member._id,
                    isDeleted: false
                });

                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(t => t.status === "completed").length;
                const activeTasks = tasks.filter(t => t.status === "pending").length;

                return {
                    ...member.toObject(),
                    totalTasks,
                    activeTasks,
                    completedTasks
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Team members with task stats fetched successfully",
            data: teamWithTasks
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};

export const getTeamProgressData = async (req, res) => {
    try {
        const { id } = req.user; // manager id

        // 1️⃣ Get team members
        const teamMembers = await Employee.find({
            assignManagerId: id,
            isDeleted: false
        }).select("_id fullName email avatar roleName");

        const teamMemberIds = teamMembers.map(emp => emp._id);

        // 2️⃣ Get all team tasks
        const teamTasks = await Task.find({
            assignEmployees: { $in: teamMemberIds },
            isDeleted: false
        });

        const totalTasks = teamTasks.length;
        const completedTasks = teamTasks.filter(t => t.status === "completed").length;
        const pendingTasks = teamTasks.filter(t => t.status === "pending").length;

        const successRate = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        // 3️⃣ Calculate employee-wise completed tasks
        const employeeStats = await Promise.all(
            teamMembers.map(async (emp) => {
                const empTasks = await Task.find({
                    assignEmployees: emp._id,
                    isDeleted: false
                });

                const completed = empTasks.filter(t => t.status === "completed").length;

                return {
                    _id: emp._id,
                    fullName: emp.fullName,
                    email: emp.email,
                    avatar: emp.avatar,
                    roleName: emp.roleName,
                    completedTasks: completed
                };
            })
        );

        // 4️⃣ Top 5 performers
        const topPerformers = employeeStats
            .sort((a, b) => b.completedTasks - a.completedTasks)
            .slice(0, 5);

        // 5️⃣ Response
        res.status(200).json({
            success: true,
            message: "Team progress data fetched successfully",
            data: {
                totalTeamMembers: teamMembers.length,
                totalTasks,
                completedTasks,
                pendingTasks,
                successRate, // %
                topPerformers
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

export const getManagerTasks = async (req, res) => {
    try {
        const { id } = req.user; // manager id

        const tasks = await Task.find({
            assignManagerId: id,
            isDeleted: false,
        }).populate("assignEmployees", "fullName email");

        res.status(200).json({
            success: true,
            message: "Manager tasks fetched successfully",
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

export const getManagerAllTasks = async (req, res) => {
    try {
        const { id } = req.user; // manager id

        // All tasks of manager
        const tasks = await Task.find({
            assignManagerId: id,
            isDeleted: false,
        })
            .populate("assignEmployees", "fullName email roleName avatar")
            .populate("assignManagerId", "fullName email");

        // Split tasks
        const completedTasks = tasks.filter(task => task.status === "completed");
        const pendingTasks = tasks.filter(task => task.status === "pending");

        res.status(200).json({
            success: true,
            message: "Manager tasks fetched successfully",
            data: {
                totalTasks: tasks.length,
                completedTasksCount: completedTasks.length,
                pendingTasksCount: pendingTasks.length,
                completedTasks,
                pendingTasks
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
