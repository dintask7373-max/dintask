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

  // 2. Count current users (excluding the Admin themselves if they are not counted in the limit)
  // Usually, userLimit is for staff (Managers, Sales, Employees)
  const [managers, sales, employees] = await Promise.all([
    Manager.countDocuments({ adminId }),
    SalesExecutive.countDocuments({ adminId }),
    Employee.countDocuments({ adminId })
  ]);

  const totalUsers = managers + sales + employees;
  
  // Use admin.userLimit which is the capacity provisioned for this specific admin
  const currentLimit = admin.userLimit || 1; 
  const remaining = currentLimit - totalUsers;

  if (totalUsers >= currentLimit) {
    return {
      allowed: false,
      error: `Subscription limit reached! Your workspace capacity is ${currentLimit} members. You currently have ${totalUsers} members (${managers} managers, ${sales} sales executives, ${employees} employees). Please expand your team size to add more members.`,
      limit: currentLimit,
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
    limit: currentLimit,
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
