const Project = require('../models/Project');
const Task = require('../models/Task');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');

// @desc    Get projects for the logged-in user (Manager or Admin)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    let adminId;

    if (req.user.role === 'admin') {
      // Admin sees all projects in their workspace
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

      // Manager sees projects assigned to them (within their workspace)
      query = {
        manager: req.user.id,
        adminId: adminId
      };
    } else if (req.user.role === 'sales_executive') {
      // Get sales exec's adminId
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Executive not found' });
      adminId = salesExec.adminId;

      // Sales sees their deals turned projects (within their workspace)
      query = {
        salesRep: req.user.id,
        adminId: adminId
      };
    }

    const projects = await Project.find(query)
      .populate('client', 'name company email mobile')
      .populate('manager', 'name email')
      .populate('salesRep', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: projects });
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
    });

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

    // CASCADE DELETION: Purge all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    // Delete the project
    await project.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Project and all associated tasks purged successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
