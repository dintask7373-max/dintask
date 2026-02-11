const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get manager profile
// @route   GET /api/v1/manager/me
// @access  Private (Manager)
exports.getMe = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: manager
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all employees (for manager view - workspace-specific)
// @route   GET /api/v1/manager/employees
// @access  Private (Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    // Get manager's adminId
    const manager = await Manager.findById(req.user.id);
    if (!manager) {
      return next(new ErrorResponse('Manager not found', 404));
    }

    // Fetch only employees from THIS manager's workspace
    const employees = await Employee.find({
      adminId: manager.adminId,
      status: { $in: ['active', 'inactive'] }  // Approved employees (online or offline)
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee performance metrics
// @route   GET /api/v1/manager/performance/employees
// @access  Private (Manager)
exports.getEmployeePerformanceMetrics = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const LoginActivity = require('../models/LoginActivity');

    const managerId = req.user.id;
    console.log('🔍 Manager ID:', managerId);

    const manager = await Manager.findById(managerId);
    console.log('👤 Manager found:', manager ? manager.name : 'NOT FOUND');

    if (!manager) {
      return next(new ErrorResponse('Manager not found', 404));
    }

    // Get employees under this manager
    const employees = await Employee.find({
      $or: [
        { managerId: managerId },
        { adminId: manager.adminId }
      ],
      status: 'active'
    });
    console.log('👥 Employees found:', employees.length);

    // Get all tasks assigned by this manager OR in the same workspace
    const tasks = await Task.find({
      $or: [
        { assignedBy: managerId },
        { adminId: manager.adminId }
      ]
    }).populate('assignedTo');
    console.log('📋 Tasks found:', tasks.length);

    const performanceData = await Promise.all(employees.map(async (employee) => {
      const employeeId = employee._id.toString();

      // Filter tasks for this employee
      const employeeTasks = tasks.filter(task =>
        task.assignedTo && task.assignedTo.some(assignee =>
          assignee._id.toString() === employeeId
        )
      );

      const now = new Date();
      const completedTasks = employeeTasks.filter(t => t.status === 'completed');
      const inProgressTasks = employeeTasks.filter(t => t.status === 'in_progress');
      const pendingTasks = employeeTasks.filter(t => t.status === 'pending');
      const overdueTasks = employeeTasks.filter(t =>
        t.deadline && new Date(t.deadline) < now && t.status !== 'completed'
      );

      // Calculate completion rate
      const completionRate = employeeTasks.length > 0
        ? Math.round((completedTasks.length / employeeTasks.length) * 100)
        : 0;

      // Calculate on-time delivery rate
      const completedOnTime = completedTasks.filter(t => {
        if (!t.deadline) return true;
        const completedAt = t.updatedAt || t.createdAt;
        return new Date(completedAt) <= new Date(t.deadline);
      });
      const onTimeDeliveryRate = completedTasks.length > 0
        ? Math.round((completedOnTime.length / completedTasks.length) * 100)
        : 0;

      // Current workload
      const currentWorkload = inProgressTasks.length + pendingTasks.length;
      let workloadStatus = 'idle';
      if (currentWorkload > 10) workloadStatus = 'overloaded';
      else if (currentWorkload >= 6) workloadStatus = 'normal';
      else if (currentWorkload >= 1) workloadStatus = 'light';

      // Priority breakdown
      const priorityBreakdown = {
        urgent: employeeTasks.filter(t => t.priority === 'urgent').length,
        high: employeeTasks.filter(t => t.priority === 'high').length,
        medium: employeeTasks.filter(t => t.priority === 'medium').length,
        low: employeeTasks.filter(t => t.priority === 'low').length
      };

      // Average progress
      const avgProgress = employeeTasks.length > 0
        ? Math.round(employeeTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / employeeTasks.length)
        : 0;

      // Average task duration (for completed tasks)
      const completedWithDuration = completedTasks.filter(t => t.createdAt && t.updatedAt);
      const avgTaskDuration = completedWithDuration.length > 0
        ? Math.round(
          completedWithDuration.reduce((sum, t) => {
            const duration = (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + duration;
          }, 0) / completedWithDuration.length
        )
        : 0;

      // Get last login activity
      const lastActivity = await LoginActivity.findOne({
        userId: employeeId,
        roleModel: 'Employee'
      }).sort({ loginAt: -1 });

      return {
        employeeId,
        name: employee.name,
        email: employee.email,
        profileImage: employee.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1574026613/profile.jpg',
        metrics: {
          totalTasks: employeeTasks.length,
          completedTasks: completedTasks.length,
          inProgressTasks: inProgressTasks.length,
          pendingTasks: pendingTasks.length,
          overdueTasks: overdueTasks.length,
          completionRate,
          onTimeDeliveryRate,
          currentWorkload,
          workloadStatus,
          priorityBreakdown,
          avgProgress,
          avgTaskDuration,
          lastActive: lastActivity?.loginAt || null,
          lastLogout: lastActivity?.logoutAt || null
        }
      };
    }));

    console.log('✅ Performance data generated for', performanceData.length, 'employees');

    res.status(200).json({
      success: true,
      count: performanceData.length,
      data: performanceData
    });
  } catch (err) {
    console.error('❌ Error in getEmployeePerformanceMetrics:', err);
    next(err);
  }
};
