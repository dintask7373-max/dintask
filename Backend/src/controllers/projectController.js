const Project = require('../models/Project');
const Task = require('../models/Task');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');

// @desc    Get projects for the logged-in user (Manager or Admin)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const startIndex = (page - 1) * limit;

    let query = {};
    let adminId;

    if (req.user.role === 'admin') {
      adminId = req.user.id;
      query = { adminId: adminId };
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      if (!manager) return res.status(404).json({ success: false, error: 'Manager not found' });
      adminId = manager.adminId;
      query = { manager: req.user.id, adminId: adminId };
    } else if (req.user.role === 'sales_executive') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Executive not found' });
      adminId = salesExec.adminId;
      query = { salesRep: req.user.id, adminId: adminId };
    }

    // Advanced search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'client.name': searchRegex },
        { 'client.company': searchRegex }
      ];
    }

    // To search within populated client fields properly, we might need a different approach 
    // but for now, we'll fetch and filter if needed, or use a more complex aggregation.
    // However, Mongoose doesn't support $or on populated fields directly without aggregation.
    // Let's stick to a simpler name search or use a better query if client info is stored in Project.

    // Check Project model to see if it has client info embedded or just ref.
    // For now, let's just search by Project Name.

    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('client', 'name company email mobile')
      .populate('manager', 'name email')
      .populate('salesRep', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: projects
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client')
      .populate('manager')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      userAdminId = manager?.adminId;
    } else if (req.user.role === 'sales_executive') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      userAdminId = salesExec?.adminId;
    }

    // Check if project belongs to user's workspace
    if (project.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Project belongs to different workspace' });
    }

    // Verify access (manager-specific)
    if (req.user.role === 'manager' && project.manager.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this project' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update project (Manager updates status, etc)
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      userAdminId = manager?.adminId;
    }

    // Check if project belongs to user's workspace
    if (project.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Project belongs to different workspace' });
    }

    // Check ownership (manager-specific)
    if (req.user.role === 'manager' && project.manager.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('salesRep', 'name').populate('manager', 'name');

    // -- NOTIFICATIONS: Status Update --
    if (req.body.status && req.body.status !== project.status) {
      const Notification = require('../models/Notification');
      const Employee = require('../models/Employee');

      // Notify Admin and Sales Rep
      const participants = [];
      if (project.adminId) participants.push({ id: project.adminId, link: `/admin/projects` });
      if (project.salesRep) participants.push({ id: project.salesRep._id || project.salesRep, link: `/sales/deals` });

      const adminSalesNotifs = participants.map(p =>
        Notification.create({
          recipient: p.id,
          sender: req.user.id,
          adminId: project.adminId,
          type: 'general',
          title: 'Project Status Updated',
          message: `Project "${project.name}" status changed to ${req.body.status} by Manager ${req.user.name}.`,
          link: p.link
        })
      );
      await Promise.all(adminSalesNotifs);

      // Also notify all Employees assigned to tasks in this project
      try {
        const projectTasks = await Task.find({ project: project._id }).select('assignedTo');
        const allEmployeeIds = [...new Set(
          projectTasks.flatMap(t => t.assignedTo.map(id => id.toString()))
        )];

        if (allEmployeeIds.length > 0) {
          const statusLabel = req.body.status;
          const empTitle = statusLabel === 'completed' ? 'Project Completed!' :
            statusLabel === 'on_hold' ? 'Project On Hold' :
              statusLabel === 'cancelled' ? 'Project Cancelled' : 'Project Status Updated';
          const empMessage = statusLabel === 'completed'
            ? `Project "${project.name}" has been completed. Well done!`
            : statusLabel === 'on_hold'
              ? `Project "${project.name}" has been put on hold by ${req.user.name}. Your tasks are paused.`
              : statusLabel === 'cancelled'
                ? `Project "${project.name}" has been cancelled by ${req.user.name}. Associated tasks have been removed.`
                : `Project "${project.name}" status has been updated to "${statusLabel}" by ${req.user.name}.`;

          const empNotifs = allEmployeeIds.map(empId => ({
            recipient: empId,
            sender: req.user.id,
            adminId: project.adminId,
            type: 'general',
            title: empTitle,
            message: empMessage,
            link: `/employee/tasks`
          }));
          await Notification.insertMany(empNotifs);
        }
      } catch (err) {
        console.error('Employee Project Notification Error:', err);
      }
    }

    // CASCADE STATUS SYNC: If project is on_hold or cancelled, pause all associated tasks
    if (['on_hold', 'cancelled'].includes(req.body.status)) {
      await Task.updateMany(
        { project: project._id, status: { $ne: 'completed' } },
        { $set: { status: req.body.status === 'on_hold' ? 'pending' : 'cancelled' } }
      );
    }

    res.status(200).json({ success: true, data: project });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'manager') {
      const manager = await Manager.findById(req.user.id);
      userAdminId = manager?.adminId;
    }

    // Check workspace
    if (project.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Authorization denied' });
    }

    // -- NOTIFICATION: Deletion Alert --
    const Notification = require('../models/Notification');
    if (project.adminId && req.user.role === 'manager') {
      await Notification.create({
        recipient: project.adminId,
        sender: req.user.id,
        adminId: project.adminId,
        type: 'security_alert',
        title: 'Project Purged',
        message: `Security Alert: Manager ${req.user.name} has deleted the project "${project.name}" and all its historical tasks.`,
        link: '/admin/projects'
      });
    }

    // CASCADE DELETION: Purge all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    // Delete the project
    await project.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Project and all associated tasks purged successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
