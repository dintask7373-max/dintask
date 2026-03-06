const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');
const Employee = require('../models/Employee');
const Plan = require('../models/Plan');

const checkUserLimit = async (adminId) => {
  // 1. Get Admin and their plan
  const admin = await Admin.findById(adminId);
  if (!admin) return {
    allowed: false,
    error: 'Admin not found',
    current: 0,
    limit: 0,
    breakdown: { managers: 0, salesExecutives: 0, employees: 0 }
  };

  // Get plan details - handle both string based and reference based
  let plan;
  if (admin.subscriptionPlanId) {
    plan = await Plan.findById(admin.subscriptionPlanId);
  } else {
    // Fallback to name search if ID not set
    plan = await Plan.findOne({ name: admin.subscriptionPlan });
  }

  if (!plan) {
    // If no plan found, deny access for safety
    return {
      allowed: false,
      error: 'No subscription plan found. Please contact support.',
      current: 0,
      limit: 0,
      breakdown: { managers: 0, salesExecutives: 0, employees: 0 }
    };
  }

  // 2. Count current users
  const [managers, sales, employees] = await Promise.all([
    Manager.countDocuments({ adminId }),
    SalesExecutive.countDocuments({ adminId }),
    Employee.countDocuments({ adminId })
  ]);

  const totalUsers = managers + sales + employees;
  const remaining = plan.userLimit - totalUsers;

  if (totalUsers >= plan.userLimit) {
    return {
      allowed: false,
      error: `Subscription limit reached! Your ${plan.name} plan allows ${plan.userLimit} members. You currently have ${totalUsers} members (${managers} managers, ${sales} sales executives, ${employees} employees). Please upgrade your plan to add more members.`,
      limit: plan.userLimit,
      current: totalUsers,
      remaining: 0,
      breakdown: {
        managers,
        salesExecutives: sales,
        employees
      }
    };
  }

  return {
    allowed: true,
    limit: plan.userLimit,
    current: totalUsers,
    remaining,
    breakdown: {
      managers,
      salesExecutives: sales,
      employees
    }
  };
};

module.exports = checkUserLimit;
