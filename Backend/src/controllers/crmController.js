const Lead = require('../models/Lead');
const Project = require('../models/Project');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');

// @desc    Get all leads
// @route   GET /api/crm/leads
// @access  Private (Admin, Sales)
exports.getLeads = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 100 } = req.query;
    console.log(`[CRM DEBUG] Fetching Leads for User: ${req.user.name} (${req.user.id}), Role: ${req.user.role}, Filters:`, { search, status, priority });

    let query = { adminId: req.user.id };

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) {
        return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      }
      query = { owner: salesExec._id, adminId: salesExec.adminId };
    } else if (req.user.role === 'admin') {
      query = { adminId: req.user.id };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const total = await Lead.countDocuments(query);
    const skip = (page - 1) * limit;

    const leads = await Lead.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: leads.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit)
      },
      data: leads
    });
  } catch (err) {
    console.error(`[CRM DEBUG] Error in getLeads:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a new lead
// @route   POST /api/crm/leads
// @access  Private (Admin, Sales)
exports.createLead = async (req, res) => {
  try {
    const leadData = { ...req.body };
    let adminId = req.user.id;
    let owner = null;

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      adminId = salesExec.adminId;
      owner = salesExec._id;
    } else {
      // Admin creating: Owner is optional or provided in body
      if (leadData.owner) owner = leadData.owner;
    }

    // Sanitize owner field to avoid CastErrors
    if (leadData.owner === "" || leadData.owner === "unassigned") {
      delete leadData.owner;
      owner = undefined; // Ensure the 'owner' variable used in Lead.create is also undefined
    }

    let lead = await Lead.create({
      ...leadData,
      adminId,
      owner: owner || undefined
    });

    // Populate owner for consistent frontend display
    lead = await Lead.findById(lead._id).populate('owner', 'name email');

    // If owner is assigned during creation, send notification
    if (owner) {
      const leadName = lead.name || 'New Lead';
      const companyName = lead.company || 'No Company';

      await Notification.create({
        recipient: owner,
        sender: req.user.id,
        adminId: adminId,
        type: 'lead_assigned',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${leadName} (${companyName})`,
        link: `/sales/deals`
      });
    }

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/crm/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      userAdminId = salesExec?.adminId;
    }

    // Check if lead belongs to user's workspace
    if (lead.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this lead - different workspace' });
    }

    if (req.body.owner === 'unassigned') {
      req.body.owner = null;
    }

    const oldStatus = lead.status;
    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'name email');

    // 1. Notify Admin if lead is marked "Won"
    if (req.body.status === 'Won' && oldStatus !== 'Won') {
      try {
        await Notification.create({
          recipient: lead.adminId,
          sender: req.user.id,
          adminId: lead.adminId,
          type: 'deal_won',
          title: 'Deal Won! 🎉',
          message: `Victory! Lead "${lead.name}" from "${lead.company || 'Unknown'}" has been marked as WON.`,
          link: `/sales/deals`
        });
      } catch (err) {
        console.error('CRM Won Notification Error:', err);
      }
    }

    // 2. Notify Sales Executive if Admin updates their lead
    if (req.user.role === 'admin') {
      const currentOwner = lead.owner?._id || lead.owner;
      if (currentOwner) {
        try {
          // If status or something major changed but owner remains the same
          if (req.body.status && req.body.status !== oldStatus && req.body.status !== 'Won') {
            await Notification.create({
              recipient: currentOwner,
              sender: req.user.id,
              adminId: lead.adminId,
              type: 'general',
              title: 'Lead Status Updated',
              message: `Admin updated the status of your lead "${lead.name}" to "${req.body.status}".`,
              link: `/sales/deals`
            });
          } else if (req.body.name || req.body.company || req.body.amount || req.body.priority) {
            // General update notification
            await Notification.create({
              recipient: currentOwner,
              sender: req.user.id,
              adminId: lead.adminId,
              type: 'general',
              title: 'Lead Details Updated',
              message: `Admin updated the details of your lead "${lead.name}".`,
              link: `/sales/deals`
            });
          }
        } catch (err) { console.error('Sales Rep Update Notification Error:', err); }
      }
    }

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Assign lead to Sales Executive
// @route   PUT /api/crm/leads/:id/assign
// @access  Private (Admin)
exports.assignLead = async (req, res) => {
  try {
    const { employeeId } = req.body;
    let lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // Verify lead belongs to admin's workspace
    if (lead.adminId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized - different workspace' });
    }

    lead.owner = employeeId;
    await lead.save();

    const populatedLead = await Lead.findById(lead._id).populate('owner', 'name email');

    // Create Notification for the Sales Executive
    await Notification.create({
      recipient: employeeId,
      sender: req.user.id,
      adminId: lead.adminId,
      type: 'lead_assigned',
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${lead.name} (${lead.company || 'No Company'})`,
      link: `/sales/deals`
    });

    res.status(200).json({ success: true, data: populatedLead, message: 'Lead assigned successfully' });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// @desc    Delete a lead
// @route   DELETE /api/crm/leads/:id
// @access  Private (Admin)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      userAdminId = salesExec?.adminId;
    }

    // Check if lead belongs to user's workspace
    if (lead.adminId.toString() !== userAdminId?.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this lead - different workspace' });
    }

    // Notify Sales Executive if their assigned lead was deleted by Admin
    if (req.user.role === 'admin' && lead.owner) {
      try {
        await Notification.create({
          recipient: lead.owner,
          sender: req.user.id,
          adminId: lead.adminId,
          type: 'general',
          title: 'Lead Removed',
          message: `Your lead "${lead.name}" (${lead.company || 'No Company'}) has been removed by the Admin.`,
          link: `/sales/deals`
        });
      } catch (err) {
        console.error('Lead Delete Notification Error:', err);
      }
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {}, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Bulk delete leads
// @route   POST /api/crm/leads/bulk-delete
// @access  Private (Admin, Sales)
exports.bulkDeleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Lead IDs are required' });
    }

    // Get user's adminId
    let userAdminId;
    if (req.user.role === 'admin') {
      userAdminId = req.user.id;
    } else if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      userAdminId = salesExec?.adminId;
    }

    // Delete leads that belong to this admin's workspace
    const result = await Lead.deleteMany({
      _id: { $in: ids },
      adminId: userAdminId
    });

    res.status(200).json({
      success: true,
      data: {},
      message: `Successfully deleted ${result.deletedCount} leads`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// @desc    Request project conversion
// @route   PUT /api/crm/leads/:id/request-project
// @access  Private (Sales)
exports.requestProjectConversion = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    if (lead.status !== 'Won') {
      return res.status(400).json({ success: false, error: 'Only Won leads can be converted' });
    }

    if (!lead.amount || lead.amount <= 0) {
      return res.status(400).json({ success: false, error: 'Project budget cannot be zero. Please update the deal amount first.' });
    }

    if (!lead.deadline) {
      return res.status(400).json({ success: false, error: 'Mandatory: Please set a project deadline before conversion.' });
    }

    lead.approvalStatus = 'pending_project';
    await lead.save();

    // Notify Admin about Project Conversion Request
    try {
      await Notification.create({
        recipient: lead.adminId,
        sender: req.user.id,
        adminId: lead.adminId,
        type: 'conversion_request',
        title: 'Project Conversion Requested',
        message: `Sales rep ${req.user.name} requested converting lead "${lead.name}" into a Project.`,
        link: `/admin/sales`
      });
    } catch (err) {
      console.error('Project Request Notification Error:', err);
    }

    res.status(200).json({ success: true, data: lead, message: 'Project conversion requested' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// @desc    Approve project and assign manager
// @route   POST /api/crm/leads/:id/approve-project
// @access  Private (Admin)
exports.approveProject = async (req, res) => {
  try {
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ success: false, error: 'Manager ID is required' });

    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // Check if project already exists
    if (lead.projectRef) {
      return res.status(400).json({ success: false, error: 'Project already created for this lead' });
    }

    // Create Project
    const project = await Project.create({
      name: `${lead.company || lead.name} Project`,
      description: lead.notes || 'Project initialized from CRM Lead.',
      client: lead._id,
      clientCompany: lead.company,
      manager: managerId,
      salesRep: lead.owner,
      assignedBy: req.user.id,
      adminId: lead.adminId, // Inherit adminId from lead
      budget: lead.amount,
      deadline: lead.deadline
    });

    // Update Lead
    lead.approvalStatus = 'approved_project';
    lead.projectRef = project._id;
    await lead.save();

    // Create Notification for the Manager
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: managerId,
      sender: req.user.id,
      adminId: lead.adminId,
      type: 'project_assigned',
      title: 'New Project Assigned',
      message: `You have been assigned a new project: ${project.name}`,
      link: `/manager/projects/${project._id}`
    });

    // Notify Sales Rep about Approval
    if (lead.owner) {
      try {
        await Notification.create({
          recipient: lead.owner,
          sender: req.user.id,
          adminId: lead.adminId,
          type: 'project_approved',
          title: 'Lead Approved as Project',
          message: `Your lead "${lead.name}" for "${lead.company || 'Unknown'}" has been approved and is now an active project managed by ${req.body.managerName || 'a manager'}.`,
          link: `/sales/deals`
        });
      } catch (err) { console.error('Sales Rep Approval Notification Error:', err); }
    }

    res.status(200).json({ success: true, data: project, lead: lead, message: 'Project approved and assigned' });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// @desc    Get pending projects
// @route   GET /api/crm/leads/pending-projects
// @access  Private (Admin)
// @desc    Get pending projects
// @route   GET /api/crm/leads/pending-projects
// @access  Private (Admin, Sales)
exports.getPendingProjects = async (req, res) => {
  try {
    let adminId = req.user.id;
    const search = req.query.search || '';

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      adminId = salesExec.adminId;
    }

    let query = {
      adminId: adminId,
      status: 'Won',
      approvalStatus: 'pending_project'
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { company: searchRegex }
      ];
    }

    const leads = await Lead.find(query).populate('owner', 'name');

    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}


// @desc    Get sales executives for dropdown
// @route   GET /api/crm/sales-executives
// @access  Private (Admin, Sales)
exports.getSalesExecutives = async (req, res) => {
  try {
    let adminId = req.user.id;

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      adminId = salesExec.adminId;
    }

    const executives = await SalesExecutive.find({ adminId: adminId });
    res.status(200).json({ success: true, data: executives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
// @desc    Get sales report data
// @route   GET /api/crm/reports
// @access  Private (Admin, Sales)
exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let query = { adminId: req.user.id };

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      query = { owner: salesExec._id, adminId: salesExec.adminId };
    }

    // Determine date range based on period
    const now = new Date();
    let startDate = new Date();
    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    query.createdAt = { $gte: startDate };

    const leads = await Lead.find(query);

    // Basic Metrics
    const totalDeals = leads.length;
    const wonLeads = leads.filter(l => l.status === 'Won');
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.amount || 0), 0);
    const avgDealValue = totalDeals > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.amount || 0), 0) / totalDeals) : 0;
    const conversionRate = totalDeals > 0 ? Math.round((wonLeads.length / totalDeals) * 100) : 0;

    // Revenue Trajectory (Chart Data)
    // Group by date based on period
    const trajectoryMap = {};
    leads.forEach(l => {
      if (l.status === 'Won') {
        const dateKey = l.createdAt.toISOString().split('T')[0];
        trajectoryMap[dateKey] = (trajectoryMap[dateKey] || 0) + (l.amount || 0);
      }
    });

    const trajectory = Object.keys(trajectoryMap)
      .sort()
      .map(date => ({
        date,
        revenue: trajectoryMap[date]
      }));

    // Status Distribution
    const statusMap = {};
    leads.forEach(l => {
      statusMap[l.status] = (statusMap[l.status] || 0) + 1;
    });
    const distribution = Object.keys(statusMap).map(status => ({
      name: status,
      value: statusMap[status]
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalRevenue,
          totalDeals,
          avgDealValue,
          wonDealsCount: wonLeads.length,
          conversionRate,
          revenueChange: '+12.5%', // Placeholder for now, could calculate vs previous period
          dealsChange: '+8.2%',
          avgValueChange: '+4.1%'
        },
        trajectory,
        distribution,
        period
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
