const Schedule = require('../models/Schedule');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Admin = require('../models/Admin');

// @desc    Get all schedules for logged in user (Admin, Manager, Employee, or Sales)
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    let schedules;

    // All users see schedules they created OR where they are participants
    schedules = await Schedule.find({
      $or: [
        { createdBy: req.user.id },
        { 'participants.userId': req.user.id }
      ]
    }).sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new schedule (Admin only)
// @route   POST /api/schedules
// @access  Private/Admin
exports.createSchedule = async (req, res) => {
  try {
    const { date, time, endTime } = req.body;

    // Check for overlapping events on the same date
    const overlappingEvent = await Schedule.findOne({
      date,
      $or: [
        {
          // New start time is between existing start and end
          time: { $lte: time },
          endTime: { $gt: time }
        },
        {
          // New end time is between existing start and end
          time: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          // Existing event is completely within new event
          time: { $gte: time },
          endTime: { $lte: endTime }
        }
      ]
    });

    if (overlappingEvent) {
      return res.status(400).json({
        success: false,
        message: `Time slot conflict: An event already exists from ${overlappingEvent.time} to ${overlappingEvent.endTime}`
      });
    }

    // Add createdBy to req.body
    req.body.createdBy = req.user.id;

    const schedule = await Schedule.create(req.body);

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Only creator can update
    if (schedule.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Only the original creator can modify this tactical entry'
      });
    }

    const { date, time, endTime } = req.body;
    if (date || time || endTime) {
      const checkDate = date || schedule.date;
      const checkStart = time || schedule.time;
      const checkEnd = endTime || schedule.endTime;

      // Check for overlapping events (excluding self)
      const overlappingEvent = await Schedule.findOne({
        _id: { $ne: req.params.id },
        date: checkDate,
        $or: [
          {
            time: { $lte: checkStart },
            endTime: { $gt: checkStart }
          },
          {
            time: { $lt: checkEnd },
            endTime: { $gte: checkEnd }
          },
          {
            time: { $gte: checkStart },
            endTime: { $lte: checkEnd }
          }
        ]
      });

      if (overlappingEvent) {
        return res.status(400).json({
          success: false,
          message: `Update Failed: Temporal conflict detected with event "${overlappingEvent.title}" (${overlappingEvent.time} - ${overlappingEvent.endTime})`
        });
      }
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Only creator can delete
    if (schedule.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Only the official creator can purge this record'
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all potential participants (Managers + Employees + Sales)
// @route   GET /api/schedules/participants
// @access  Private/Admin
exports.getAllParticipants = async (req, res) => {
  try {
    let filter = {};
    let adminIdForFilter = null;

    if (req.user.role === 'admin') {
      adminIdForFilter = req.user.id;
      filter = { adminId: req.user.id };
    } else if (req.user.role === 'superadmin') {
      filter = {};
    } else {
      adminIdForFilter = req.user.adminId || req.user.id;
      filter = { adminId: adminIdForFilter };
    }

    const [admin, managers, employees, sales] = await Promise.all([
      adminIdForFilter ? Admin.findById(adminIdForFilter).select('name email') : Promise.resolve(null),
      Manager.find({ ...filter, status: { $in: ['active', 'inactive'] } }).select('name email status'),
      Employee.find({ ...filter, status: { $in: ['active', 'inactive'] } }).select('name email status'),
      SalesExecutive.find({ ...filter, status: { $in: ['active', 'inactive'] } }).select('name email status')
    ]);

    let participants = [];

    if (req.user.role === 'sales') {
      // Sales see Admin, Managers, and other Sales
      participants = [
        ...(admin ? [{ ...admin._doc, userType: 'Admin' }] : []),
        ...managers.map(m => ({ ...m._doc, userType: 'Manager' })),
        ...sales.map(s => ({ ...s._doc, userType: 'SalesExecutive' }))
      ];
    } else if (req.user.role === 'employee') {
      // Employees see Admin, Managers, and other Employees
      participants = [
        ...(admin ? [{ ...admin._doc, userType: 'Admin' }] : []),
        ...managers.map(m => ({ ...m._doc, userType: 'Manager' })),
        ...employees.map(e => ({ ...e._doc, userType: 'Employee' }))
      ];
    } else {
      // Admin and Managers see everyone
      participants = [
        ...(admin ? [{ ...admin._doc, userType: 'Admin' }] : []),
        ...managers.map(m => ({ ...m._doc, userType: 'Manager' })),
        ...employees.map(e => ({ ...e._doc, userType: 'Employee' })),
        ...sales.map(s => ({ ...s._doc, userType: 'SalesExecutive' }))
      ];
    }

    // Always exclude self
    participants = participants.filter(p => p._id.toString() !== req.user.id);

    res.status(200).json({
      success: true,
      data: participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
