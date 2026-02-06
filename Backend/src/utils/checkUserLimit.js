const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');
const Employee = require('../models/Employee');
const Plan = require('../models/Plan');

const checkUserLimit = async (adminId) => {
  // 1. Get Admin and their plan
  const admin = await Admin.findById(adminId);
  if (!admin) return { allowed: false, error: 'Admin not found' };

  // Get plan details - handle both string based and reference based if we refactor later
  // For now, let's assume we fetch by name or ID if we refactor Admin model
  let plan;
  if (admin.subscriptionPlanId) {
    plan = await Plan.findById(admin.subscriptionPlanId);
  } else {
    // Fallback to name search if ID not set
    plan = await Plan.findOne({ name: admin.subscriptionPlan });
  }

  if (!plan) {
    // If no plan found, use some default or allow if it's a legacy account?
    // Let's assume Starter as default if nothing found
    return { allowed: true, limit: Infinity }; // Or set a strict default
  }

  // 2. Count current users
  const [managers, sales, employees] = await Promise.all([
    Manager.countDocuments({ adminId }),
    SalesExecutive.countDocuments({ adminId }),
    Employee.countDocuments({ adminId })
  ]);

  const totalUsers = managers + sales + employees;

  if (totalUsers >= plan.userLimit) {
    return {
      allowed: false,
      error: `Plan limit reached. You can only add up to ${plan.userLimit} users.`,
      limit: plan.userLimit,
      current: totalUsers
    };
  }

  return { allowed: true, limit: plan.userLimit, current: totalUsers };
};

module.exports = checkUserLimit;
