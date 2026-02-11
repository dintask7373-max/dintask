const Task = require('../models/Task');
const Project = require('../models/Project');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Team = require('../models/Team');

// @desc    Get All Tasks (Filtered by role)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    let adminId;

    // Find teams the user is part of
    const userTeams = await Team.find({ members: req.user.id }).select('_id');
    const teamIds = userTeams.map(t => t._id);

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

      // Find teams this user manages
      const managedTeams = await Team.find({ managerId: req.user.id }).select('_id');
      const managedTeamIds = managedTeams.map(t => t._id);

      const allRelevantTeamIds = [...new Set([...teamIds, ...managedTeamIds])];

      // Manager sees tasks assigned BY them OR assigned TO them OR associated with their managed/member teams
      query = {
        $or: [
          { assignedBy: req.user.id },
          { assignedTo: { $in: [req.user.id] } },
          { team: { $in: allRelevantTeamIds } }
        ],
        adminId: adminId
      };
    } else if (req.user.role === 'employee') {
      // Get employee's adminId
      const employee = await Employee.findById(req.user.id);
      if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
      adminId = employee.adminId;

      // Employee sees tasks assigned TO them directly OR via team
      query = {
        $or: [
          { assignedTo: { $in: [req.user.id] } },
          { team: { $in: teamIds } }
        ],
        adminId: adminId
      };
    } else if (req.user.role === 'sales_executive') {
      // Get sales exec's adminId
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Executive not found' });
      adminId = salesExec.adminId;

      // Sales sees tasks assigned TO them directly OR via team
      query = {
        $or: [
          { assignedTo: { $in: [req.user.id] } },
          { team: { $in: teamIds } }
        ],
        adminId: adminId
      };
    }

    // -- OVERDUE AUTO-CHECK & ESCALATION --
    // Automatically flag active missions that missed their tactical deadline
    if (adminId) {
      await Task.updateMany(
        {
          adminId: adminId,
          status: { $in: ['pending', 'in_progress'] },
          deadline: { $lt: new Date() }
        },
        {
          $set: { status: 'overdue' },
          $push: {
            activityLog: {
              action: 'Tactical Deadline Surpassed: Mission Escalated',
              timestamp: new Date()
            }
          }
        }
      );
    }

    // -- PROJECT STATUS SYNC: Tactical Visibility Filtering --
    // If user is Employee/Sales, hide tasks from inactive projects to reduce noise
    if (['employee', 'sales_executive'].includes(req.user.role)) {
      const activeProjects = await Project.find({
        adminId: adminId,
        status: { $in: ['active', 'completed'] }
      }).select('_id');
      const activeProjectIds = activeProjects.map(p => p._id);

      // Update query to only include tasks from active projects (or tasks with no project)
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { project: { $in: activeProjectIds } },
          { project: { $exists: false } },
          { project: null }
        ]
      });
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name')
      .populate('subTasks.user', 'name profileImage') // Populate user details in subTasks
      .populate('team', 'name')
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
    const { assignedTo, project, team } = req.body;
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

    // Prepare assignment list (individuals only)
    let finalAssignedTo = Array.isArray(assignedTo) ? [...assignedTo] : (assignedTo ? [assignedTo] : []);

    // If project specified, verify ownership and same workspace (NOW MANDATORY)
    if (!project) return res.status(400).json({ success: false, error: 'Tactical deployment requires a valid Project Mission ID' });

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, error: 'Project not found' });
    if (proj.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({ success: false, error: 'Project belongs to different workspace' });
    }

    // Initialize subTasks for per-employee tracking
    const subTasksInit = finalAssignedTo.map(userId => ({
      user: userId,
      status: 'pending',
      progress: 0
    }));

    const task = await Task.create({
      ...req.body,
      project: project, // Ensure explicitly passed
      assignedBy: req.user.id,
      assignedTo: finalAssignedTo,
      subTasks: subTasksInit,
      team: team || undefined,
      adminId: adminId,
      activityLog: [{
        user: req.user.id,
        userModel: req.user.role === 'admin' ? 'Admin' : 'Manager',
        action: 'Deployed Task'
      }]
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

    // --- GATEKEEPER PROTOCOL: Status Transition Security ---
    const updates = { ...req.body };
    const activityEntries = [];

    // Handle Sub-Task Updates for Individual Employees in Group Missions
    if (req.user.role === 'employee' || req.user.role === 'sales_executive') {
      const isAssigned = task.assignedTo.map(id => id.toString()).includes(req.user.id);

      // If updating progress/status, update their specific sub-task entry
      if (isAssigned && (req.body.status || req.body.progress)) {
        // Find or create subtask entry
        const subTaskIndex = task.subTasks.findIndex(st => st.user.toString() === req.user.id);

        if (subTaskIndex > -1) {
          // Update existing subtask
          if (req.body.status) task.subTasks[subTaskIndex].status = req.body.status;
          if (req.body.progress) task.subTasks[subTaskIndex].progress = req.body.progress;
        } else {
          // Initialize if missing (migration safety)
          task.subTasks.push({
            user: req.user.id,
            status: req.body.status || 'pending',
            progress: req.body.progress || 0
          });
        }

        // Check if ALL subtasks are complete/review to potentially update main status
        const allComplete = task.subTasks.length > 0 && task.subTasks.every(st => st.status === 'completed' || st.status === 'review');
        if (allComplete && task.status !== 'completed' && task.status !== 'review') {
          updates.status = 'review'; // Auto-escalate to review if everyone is done
        }

        // Recalculate main task progress based on subtasks (Average)
        if (task.subTasks.length > 0) {
          const totalProgress = task.subTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0);
          const avgProgress = Math.round(totalProgress / task.subTasks.length);
          updates.progress = avgProgress;
        }

        // Persist subTasks changes
        updates.subTasks = task.subTasks;
      }

      // Restrict main task status direct manipulation by employees if it's a shared task
      if (task.assignedTo.length > 1 && req.body.status === 'completed') {
        return res.status(403).json({ success: false, error: 'Group Directive: Update your individual progress. Main completion requires full squad sync.' });
      }
    }

    if (req.body.statusNotes) {
      updates.statusNotes = req.body.statusNotes;
    }

    // Check for activity log entries
    // const updates = { ...req.body }; // REMOVED DUPLICATE
    // const activityEntries = []; // REMOVED DUPLICATE

    const roleToModel = {
      'admin': 'Admin',
      'manager': 'Manager',
      'employee': 'Employee',
      'sales_executive': 'SalesExecutive'
    };
    const userModel = roleToModel[req.user.role] || 'Admin';

    if (req.body.status && req.body.status !== task.status) {
      activityEntries.push({
        user: req.user.id,
        userModel: userModel,
        action: `Status changed from ${task.status} to ${req.body.status}`
      });
    }

    if (req.body.progress !== undefined && req.body.progress !== task.progress) {
      activityEntries.push({
        user: req.user.id,
        userModel: userModel,
        action: `Progress updated to ${req.body.progress}%`
      });
    }

    if (activityEntries.length > 0) {
      updates.$push = { activityLog: { $each: activityEntries } };
      delete updates.activityLog; // Avoid overwriting
    }

    task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('activityLog.user', 'name')
      .populate('subTasks.user', 'name profileImage');

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
