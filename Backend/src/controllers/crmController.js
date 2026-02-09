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
    console.log(`[CRM DEBUG] Fetching Leads for User: ${req.user.name} (${req.user.id}), Role: ${req.user.role}`);

    let query = { adminId: req.user.id }; // By default, fetch leads for this admin's workspace

    // If Sales Executive is requesting, filter by owner
    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) {
        console.log(`[CRM DEBUG] Sales Rep NOT found for ID: ${req.user.id}`);
        return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      }

      // Detailed logging for Sales Exec
      console.log(`[CRM DEBUG] Found Sales Exec: ${salesExec.name}, AdminID: ${salesExec.adminId}`);

      // Construct query: ensure correct adminId and owner
      query = { owner: salesExec._id, adminId: salesExec.adminId };
      console.log(`[CRM DEBUG] Query used:`, JSON.stringify(query));
    }
    // If Admin is requesting, fetch all leads associated with their adminId (which is req.user.id for Admin)
    else if (req.user.role === 'admin') {
      query = { adminId: req.user.id };
      console.log(`[CRM DEBUG] Admin Query used:`, JSON.stringify(query));
    }

    const leads = await Lead.find(query).populate('owner', 'name email');

    // Log the results overview
    console.log(`[CRM DEBUG] Leads Found: ${leads.length}`);
    if (leads.length > 0) {
      const statuses = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`[CRM DEBUG] Status Breakdown:`, statuses);
    } else {
      console.log(`[CRM DEBUG] No leads found matching the criteria.`);
    }

    res.status(200).json({ success: true, count: leads.length, data: leads });
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
    let adminId = req.user.id;
    let owner = null;

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      adminId = salesExec.adminId;
      owner = salesExec._id;
    } else {
      // Admin creating: Owner is optional or provided in body
      if (req.body.owner) owner = req.body.owner;
    }

    // Sanitize owner field to avoid CastErrors
    let leadData = { ...req.body };
    if (leadData.owner === "") {
      delete leadData.owner;
      owner = undefined;
    }

    const lead = await Lead.create({
      ...leadData,
      adminId,
      owner: owner || undefined
    });

    // If owner is assigned during creation, send notification
    if (owner) {
      const leadName = lead.name || 'New Lead';
      const companyName = lead.company || 'No Company';

      await Notification.create({
        recipient: owner,
        sender: req.user.id,
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

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'name email');

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

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {}, message: 'Lead deleted successfully' });
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

    lead.approvalStatus = 'pending_project';
    await lead.save();

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

    if (req.user.role === 'sales_executive' || req.user.role === 'sales') {
      const salesExec = await SalesExecutive.findById(req.user.id);
      if (!salesExec) return res.status(404).json({ success: false, error: 'Sales Rep not found' });
      adminId = salesExec.adminId;
    }

    const leads = await Lead.find({
      adminId: adminId,
      status: 'Won',
      approvalStatus: 'pending_project'
    }).populate('owner', 'name');

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
