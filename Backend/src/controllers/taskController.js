const Task = require('../models/Task');
const Project = require('../models/Project');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');

// @desc    Get All Tasks (Filtered by role)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    let adminId;

    if (req.user.role === 'admin') {
      // Admin sees tasks in their workspace
      adminId = req.user.id;
      query = {
        assignedBy: req.user.id,
        adminId: adminId
      };
    } else if (req.user.role === 'manager') {
      // Get manager's adminId
      const manager = await Manager.findById(req.user.id);
      if (!manager) return res.status(404).json({ success: false, error: 'Manager not found' });
      adminId = manager.adminId;

      // Manager sees tasks assigned BY them OR assigned TO them (within their workspace)
      query = {
        $or: [
          { assignedBy: req.user.id },
          { assignedTo: { $in: [req.user.id] } }
        ],
        adminId: adminId
      };
    } else if (req.user.role === 'employee') {
      // Get employee's adminId
      const employee = await Employee.findById(req.user.id);
      if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
      adminId = employee.adminId;

      // Employee sees tasks assigned TO them (within their workspace)
      query = {
        assignedTo: { $in: [req.user.id] },
        adminId: adminId
      };
    } else if (req.user.role === 'sales_executive') {
      // Get sales exec's adminId
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Executive not found' });
      adminId = salesExec.adminId;

      // Sales sees tasks assigned TO them (within their workspace)
      query = {
        assignedTo: { $in: [req.user.id] },
        adminId: adminId
      };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create Task
// @route   POST /api/tasks
// @access  Private (Manager, Admin)
exports.createTask = async (req, res) => {
  try {
    const { assignedTo, project } = req.body;
    let adminId;

    // Get adminId based on user role
    if (req.user.role === 'admin') {
      adminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      if (!manager) return res.status(404).json({ success: false, error: 'Manager not found' });
      adminId = manager.adminId;
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized to create tasks' });
    }

    // If project specified, verify ownership and same workspace
    if (project) {
      const proj = await Project.findById(project);
      if (!proj) return res.status(404).json({ success: false, error: 'Project not found' });
      if (proj.adminId.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, error: 'Project belongs to different workspace' });
      }
    }

    const task = await Task.create({
      ...req.body,
      assignedBy: req.user.id,
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
      adminId: adminId
    });

    // If project, link task to project
    if (project) {
      await Project.findByIdAndUpdate(project, { $push: { tasks: task._id } });
    }

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update Task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      userAdminId = manager?.adminId;
    } else if (req.user.role === 'employee') {
      const employee = await Employee.findById(req.user.id);
      userAdminId = employee?.adminId;
    } else if (req.user.role === 'sales_executive') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      userAdminId = salesExec?.adminId;
    }

    // Check if task belongs to user's workspace
    if (task.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete Task
// @route   DELETE /api/tasks/:id
// @access  Private (Manager, Admin)
exports.deleteTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      userAdminId = manager?.adminId;
    }

    // Check if task belongs to user's workspace
    if (task.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Task belongs to different workspace' });
    }

    // Check ownership (must be assigned by this user OR user is admin)
    if (task.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
