const Task = require('../models/Task');
const Project = require('../models/Project');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

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
      // Admin sees ALL tasks in their workspace
      adminId = req.user.id;
      query = {
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
    } else {
      return res.status(403).json({ success: false, error: 'User role not authorized for task visibility' });
    }

    // -- OVERDUE AUTO-CHECK & ESCALATION --
    // Automatically flag active missions that missed their tactical deadline
    if (adminId) {
      const overdueTasks = await Task.find({
        adminId: adminId,
        status: { $in: ['pending', 'in_progress'] },
        deadline: { $lt: new Date() },
        overdueNotified: { $ne: true }
      });

      if (overdueTasks.length > 0) {
        for (const oTask of overdueTasks) {
          // Update task
          oTask.status = 'overdue';
          oTask.overdueNotified = true;
          oTask.activityLog.push({
            action: 'Tactical Deadline Surpassed: Mission Escalated',
            timestamp: new Date()
          });
          await oTask.save();

          // Notify the person who assigned the task (usually Manager)
          try {
            if (oTask.assignedBy) {
              await Notification.create({
                recipient: oTask.assignedBy,
                sender: oTask.assignedBy,
                adminId: adminId,
                type: 'task_overdue',
                title: 'Task Overdue Alert',
                message: `Alert: Task "${oTask.title}" has missed its deadline. Immediate attention required.`,
                link: `/manager/my-tasks`
              });
            }
          } catch (err) {
            console.error('Overdue Notification Error (Manager):', err);
          }

          // Also notify each assigned Employee that their task is now overdue
          try {
            if (oTask.assignedTo && oTask.assignedTo.length > 0) {
              const overdueEmployeeNotifs = oTask.assignedTo.map(empId => ({
                recipient: empId,
                sender: oTask.assignedBy || empId,
                adminId: adminId,
                type: 'task_overdue',
                title: 'Your Task Is Overdue',
                message: `Urgent: Your task "${oTask.title}" has passed its deadline. Please update your progress immediately.`,
                link: `/employee/tasks/${oTask._id}`
              }));
              await Notification.insertMany(overdueEmployeeNotifs);
            }
          } catch (err) {
            console.error('Overdue Notification Error (Employee):', err);
          }
        }
      }
    }

    // -- PROJECT STATUS SYNC: Tactical Visibility Filtering --
    // If user is Employee/Sales, hide tasks from inactive projects to reduce noise
    if (['employee'].includes(req.user.role)) {
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
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get Single Task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name avatar profileImage')
      .populate('subTasks.user', 'name profileImage')
      .populate('team', 'name')
      .populate('assignedBy', 'name');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Authorization Check (similar to getTasks but specific)
    // Admin, Manager (workspace check), Assigned User, etc.
    // For simplicity, checking if user is part of the workspace/team/assignment
    // Logic can remain relaxed as filtering happens at list level, but good to be safe.
    // Assuming if you have the ID and are authenticated in the same org, you can view it.

    res.status(200).json({ success: true, data: task });
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
    } else if (req.user.role === 'employee') {
      const employee = await Employee.findById(req.user.id);
      adminId = employee?.adminId;
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized to create tasks' });
    }

    // -- VALIDATION: Tactical Deadline Security --
    if (req.body.deadline) {
      const deadline = new Date(req.body.deadline);
      const now = new Date();
      // Allow a small buffer (e.g., 1 minute) to avoid issues with slight clock drift
      if (deadline < new Date(now.getTime() - 60000)) {
        return res.status(400).json({ success: false, error: 'Tactical deployment failure: Deadline cannot be set in the temporal past' });
      }
    }

    // Prepare assignment list (individuals only)
    let finalAssignedTo = Array.isArray(assignedTo) ? [...assignedTo] : (assignedTo ? [assignedTo] : []);

    // If project specified, verify ownership and same workspace (OPTIONAL)
    if (project) {
      const proj = await Project.findById(project);
      if (!proj) return res.status(404).json({ success: false, error: 'Project not found' });
      if (proj.adminId.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, error: 'Project belongs to different workspace' });
      }
    }

    // Initialize subTasks for per-employee tracking
    const subTasksInit = finalAssignedTo.map(userId => ({
      user: userId,
      userModel: req.body.assignedToModel || 'Employee',
      status: 'pending',
      progress: 0
    }));

    const task = await Task.create({
      ...req.body,
      project: project, // Ensure explicitly passed
      assignedBy: req.user.id,
      assignedByModel: req.user.role === 'admin' ? 'Admin' : 'Manager',
      assignedTo: finalAssignedTo,
      assignedToModel: req.body.assignedToModel || 'Employee',
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

    // -- NOTIFICATION: Alert assigned personnel (Exclude Admins as per requirement) --
    const notificationPromises = finalAssignedTo
      .filter(userId => userId.toString() !== adminId.toString())
      .map(userId =>
        Notification.create({
          recipient: userId,
          sender: req.user.id,
          title: 'New Mission Assigned',
          message: `You have been deployed to task: ${task.title}`,
          type: 'task_assigned',
          category: 'task',
          link: `/employee/tasks/${task._id}`,
          adminId: adminId
        })
      );
    await Promise.all(notificationPromises);

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
    }

    // Check if task belongs to user's workspace
    if (task.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
    }

    // -- VALIDATION: Tactical Deadline Security --
    if (req.body.deadline) {
      const deadline = new Date(req.body.deadline);
      const now = new Date();
      if (deadline < new Date(now.getTime() - 60000)) {
        return res.status(400).json({ success: false, error: 'Tactical update failure: Deadline cannot be set in the temporal past' });
      }
    }

    // --- GATEKEEPER PROTOCOL: Status Transition Security ---
    const updates = { ...req.body };
    const activityEntries = [];

    // Handle Sub-Task Updates for Individual Employees in Group Missions
    if (req.user.role === 'employee') {
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

    // --- AUTO-RESET OVERDUE STATUS ---
    // If deadline is updated to future, reset 'overdue' to 'pending'
    if (req.body.deadline) {
      const newDeadline = new Date(req.body.deadline);
      const now = new Date();
      if (task.status === 'overdue' && newDeadline > now) {
        updates.status = 'pending';
        activityEntries.push({
          user: req.user.id,
          userModel: req.user.role === 'admin' ? 'Admin' : 'Manager', // Assuming Manager/Admin updates deadline
          action: 'System: Status reset to Pending due to deadline extension'
        });
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
      'employee': 'Employee'
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

    // -- RECURRENCE LOGIC --
    if (req.body.status === 'completed' && task.recurrence && task.recurrence.type && task.recurrence.type !== 'none') {
      const { type, interval, endDate } = task.recurrence;
      // Use deadline if exists, else use current time as base
      let nextDeadline = task.deadline ? new Date(task.deadline) : new Date();
      const now = new Date();

      const intervalVal = interval || 1;

      // Calculate potential next deadline based on schedule
      if (type === 'daily') nextDeadline.setDate(nextDeadline.getDate() + intervalVal);
      if (type === 'weekly') nextDeadline.setDate(nextDeadline.getDate() + (intervalVal * 7));
      if (type === 'monthly') nextDeadline.setMonth(nextDeadline.getMonth() + intervalVal);

      // --- CRITICAL FIX: Prevent Overdue Loop ---
      // If the calculated nextDeadline is still in the past (e.g. task was completed late),
      // reschedule it starting from TODAY instead of the old cycle to ensure the new task is actionable.
      if (nextDeadline < now) {
        nextDeadline = new Date(now);
        if (type === 'daily') nextDeadline.setDate(nextDeadline.getDate() + intervalVal);
        if (type === 'weekly') nextDeadline.setDate(nextDeadline.getDate() + (intervalVal * 7));
        if (type === 'monthly') nextDeadline.setMonth(nextDeadline.getMonth() + intervalVal);
      }

      // Check if within end date (if specified)
      const isWithinEndDate = !endDate || nextDeadline <= new Date(endDate);

      if (isWithinEndDate) {
        // Reset subtasks for the new task
        const newSubTasks = task.subTasks.map(st => ({
          user: st.user,
          status: 'pending',
          progress: 0
        }));

        await Task.create({
          title: task.title,
          description: task.description,
          project: task.project, // Keep project link
          assignedTo: task.assignedTo,
          subTasks: newSubTasks,
          assignedBy: task.assignedBy,
          team: task.team,
          adminId: task.adminId,
          priority: task.priority,
          deadline: nextDeadline,
          recurrence: task.recurrence, // Propagate recurrence settings
          labels: task.labels,
          status: 'pending',
          progress: 0,
          activityLog: [{
            user: req.user.id,
            userModel: userModel, // variable from scope above
            action: 'System: Recurring Task Generated'
          }]
        });
      }
    }

    // If status changed, send appropriate notifications
    if (req.body.status && req.body.status !== task.status) {
      const isEmployee = req.user.role === 'employee';

      if (isEmployee) {
        // Employee updated status -> Notify Manager/Assigner
        const managerRecipient = task.assignedBy;
        const isRecipientAdmin = managerRecipient && managerRecipient.toString() === task.adminId.toString();

        if (managerRecipient && !isRecipientAdmin) {
          const statusLabel = req.body.status === 'review' ? 'Submitted for Review' : req.body.status;
          await Notification.create({
            recipient: managerRecipient,
            sender: req.user.id,
            title: req.body.status === 'review' ? 'Task Submitted for Review' : 'Task Status Updated',
            message: req.body.status === 'review'
              ? `Employee ${req.user.name} has submitted task "${task.title}" for your review.`
              : `Task "${task.title}" status changed to ${statusLabel} by ${req.user.name}.`,
            type: 'task_assigned',
            category: 'task',
            link: `/manager/my-tasks`,
            adminId: task.adminId
          });
        }

        // Also send a confirmation back to the Employee themselves
        if (req.body.status === 'review') {
          await Notification.create({
            recipient: req.user.id,
            sender: req.user.id,
            title: 'Task Submitted Successfully',
            message: `Your task "${task.title}" has been submitted for review. You will be notified once it is approved.`,
            type: 'general',
            category: 'task',
            link: `/employee/tasks/${task._id}`,
            adminId: task.adminId
          });
        }
      } else {
        // Manager/Admin updated status -> Notify each assigned employee
        if (task.assignedTo && task.assignedTo.length > 0) {
          const isRecipientAdmin = (id) => id.toString() === task.adminId.toString();
          const statusLabel = req.body.status;
          const notifTitle = statusLabel === 'completed' ? 'Task Approved & Completed!' :
            statusLabel === 'in_progress' ? 'Task Activated' :
              statusLabel === 'pending' ? 'Task Reset to Pending' : 'Task Status Updated';
          const notifMessage = statusLabel === 'completed'
            ? `Great work! Your task "${task.title}" has been approved and marked as completed by ${req.user.name}.`
            : `Task "${task.title}" has been updated to "${statusLabel}" by ${req.user.name}.`;

          const empNotifs = task.assignedTo
            .filter(id => !isRecipientAdmin(id))
            .map(empId => ({
              recipient: empId,
              sender: req.user.id,
              title: notifTitle,
              message: notifMessage,
              type: 'task_assigned',
              category: 'task',
              link: `/employee/tasks/${task._id}`,
              adminId: task.adminId
            }));

          if (empNotifs.length > 0) {
            await Notification.insertMany(empNotifs);
          }
        }
      }
    }

    // -- NOTIFICATION: Re-assignment --
    if (req.body.assignedTo) {
      const oldAssignees = task.assignedTo.map(id => id.toString());
      const newAssignees = req.body.assignedTo.filter(id => !oldAssignees.includes(id.toString()));

      if (newAssignees.length > 0) {
        const notifications = newAssignees.map(userId => ({
          recipient: userId,
          sender: req.user.id,
          title: 'New Mission Assigned',
          message: `You have been added to task: ${task.title}`,
          type: 'task_assigned',
          category: 'task',
          link: `/employee/tasks/${task._id}`,
          adminId: task.adminId
        }));
        await Notification.insertMany(notifications);
      }
    }

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

    // Check ownership
    const isAssigner = task.assignedBy?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    // Allow if:
    // 1. User is Admin
    // 2. User is the one who assigned/created it (Manager or Employee)
    if (!isAdmin && !isAssigner) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this task' });
    }

    // -- NOTIFICATION: Task Cancelled/Deleted --
    if (task.assignedTo && task.assignedTo.length > 0) {
      const Notification = require('../models/Notification');
      const deleterRole = req.user.role;
      const deleterName = req.user.name;
      const notifications = task.assignedTo
        .filter(recipientId => recipientId.toString() !== req.user.id) // Don't notify self
        .map(recipientId => ({
          recipient: recipientId,
          sender: req.user.id,
          adminId: task.adminId,
          type: 'general',
          title: 'Task Cancelled',
          message: `The task "${task.title}" has been cancelled by ${deleterRole === 'admin' ? 'Admin' : 'Manager'} ${deleterName}.`,
          link: '/employee/tasks'
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
