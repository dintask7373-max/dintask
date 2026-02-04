import Employee from "../../Models/EmployeeModel.js";
import Task from "../../Models/TaskModel.js";

export const managerDashboard = async (req, res) => {
    try {
        const managerId = req.user.id;

        // 1️⃣ Get team members
        const teamMembers = await Employee.find({
            assignManagerId: managerId,
            isDeleted: false
        }).select("fullName email avatar isActive");

        const teamMemberIds = teamMembers.map(emp => emp._id);

        // 2️⃣ Tasks directly assigned to this manager
        const managerTasks = await Task.find({
            assignManagerId: managerId,
            isDeleted: false
        }).sort({ createdAt: -1 });

        const myTaskCount = managerTasks.length;
        const pendingTaskCount = managerTasks.filter(t => t.status === "pending").length;

        // 3️⃣ Team tasks
        const teamTasks = await Task.find({
            assignEmployees: { $in: teamMemberIds },
            isDeleted: false
        }).sort({ completedAt: -1 });

        const completedTeamTasks = teamTasks.filter(t => t.status === "completed").length;
        const teamProgress = teamTasks.length > 0
            ? Math.round((completedTeamTasks / teamTasks.length) * 100)
            : 0;

        // 4️⃣ Recent 5 completed tasks with employee details
        const recentTasks = await Promise.all(
            teamTasks
                .filter(t => t.status === "completed")
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, 5)
                .map(async (task) => {
                    // fetch employee details
                    const employeesCompleted = await Employee.find({
                        _id: { $in: task.assignEmployees }
                    }).select("fullName email avatar role roleName");

                    return {
                        taskId: task._id,
                        title: task.title,
                        completedAt: task.completedAt,
                        completedBy: employeesCompleted
                    };
                })
        );

        // 5️⃣ Response
        res.status(200).json({
            success: true,
            message: "Manager dashboard fetched successfully",
            data: {
                myTaskCount,
                pendingTaskCount,
                totalTeamMemberCount: teamMembers.length,
                teamProgress, // %
                recentTasks
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};
