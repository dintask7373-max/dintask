import Sales from "../Models/Sales/SalesModel.js";
import SalesTarget from "../Models/Sales/SalesTargetModel.js";
import SalesUser from "../Models/Sales/SalesUserModel.js"; // Corrected Component Import
import bcrypt from "bcryptjs";
import { generateToken } from "../Helpers/generateToken.js";
import Manager from "../Models/ManagerModel.js"; // Updated to use Manager

// @desc    Register a new Sales User
// @route   POST /api/sales/register
// @access  Public
export const registerSalesUser = async (req, res) => {
    const { fullName, email, mobile, password } = req.body;

    if (!fullName || !email || !password || !mobile) {
        res.status(400);
        throw new Error("Please provide all fields: Name, Email, Mobile, Password");
    }

    // Check if user exists
    const userExists = await SalesUser.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Find a default Manager to assign to (Self-healing)
    let defaultManager = await Manager.findOne();

    // Auto-create Manager if none exists (Self-healing)
    if (!defaultManager) {
        console.log("No Manager found. Creating default Sales Manager...");
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash("manager123", salt);

        // We need an Admin ID for the Manager usually, let's try to find one or mock it?
        // ManagerModel usually requires adminId. Let's start simple.
        // Assuming ManagerModel structure. 
        // If this fails, user needs to ensure a Manager exists. 
        // But let's try to create one with a dummy ID if needed or hopefully we have an admin.

        // Actually, to avoid complexity, let's just error if no manager.
        // But user wants "Self Register". 
        // Let's TRY to find an admin for this new manager.
        const Admin = (await import("../Models/AdminModel.js")).default;
        let admin = await Admin.findOne();

        if (admin) {
            defaultManager = await Manager.create({
                fullName: "Default Sales Manager",
                email: "manager@sales.com",
                password: hashedPass,
                role: "manager",
                status: "active",
                adminId: admin._id,
                department: "Sales"
            });
        }
    }

    if (!defaultManager) {
        res.status(400);
        throw new Error("No Manager found to assign. Please ask an Admin to create a Manager first.");
    }

    // Create User (Password hashing handled in Model pre-save)
    const user = await SalesUser.create({
        fullName,
        email,
        mobile,
        password,
        role: 'sales',
        managerId: defaultManager._id
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
};

// @desc    Login Sales User
// @route   POST /api/sales/login
// @access  Public
export const loginSalesUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await SalesUser.findOne({ email });

    // Use method from model if available, else manual compare
    // Our SalesUserModel has comparePassword method.
    if (user && (await user.comparePassword(password))) {
        res.json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            token: generateToken(user._id),
            role: user.role
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
};

// @desc    Create a new sale/deal
// @route   POST /api/sales/create
// @access  Private
export const createSale = async (req, res) => {
    const { client, amount, status, dealStage, date, priority, deadline } = req.body;
    const salesRepId = req.user._id;

    if (!client || !amount) {
        res.status(400);
        throw new Error("Client and Amount are required");
    }

    // Generate a custom Deal ID (e.g., LEAD-1001)
    const count = await Sales.countDocuments();
    const dealId = `LEAD-${1001 + count}`;

    const sale = await Sales.create({
        client,
        amount,
        status: status || 'pending',
        dealStage: dealStage || 'new',
        date: date || Date.now(),
        salesRepId,
        dealId,
        priority: priority || 'medium',
        deadline: deadline || null,
        progress: status === 'won' ? 100 : (status === 'lost' ? 0 : 20)
    });

    res.status(201).json(sale);
};



// @desc    Get dashboard stats
// @route   GET /api/sales/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    const userId = req.user._id;

    // 1. Total Sales
    const totalSalesData = await Sales.aggregate([
        { $match: { salesRepId: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;

    // 2. Active Deals
    const activeDeals = await Sales.countDocuments({
        salesRepId: userId,
        status: { $in: ['pending'] }
    });

    // 3. Conversion Rate
    const totalDeals = await Sales.countDocuments({ salesRepId: userId });
    const completedDeals = await Sales.countDocuments({ salesRepId: userId, status: 'completed' });
    const conversionRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;

    // 4. Clients
    const distinctClients = await Sales.distinct('client', { salesRepId: userId });
    const clientsCount = distinctClients.length;

    res.status(200).json({
        totalSales,
        activeDeals,
        conversionRate,
        clients: clientsCount
    });
};

// @desc    Get recent sales activity
// @route   GET /api/sales/activity
// @access  Private
export const getRecentActivity = async (req, res) => {
  const userId = req.user._id;

  const activity = await Sales.find({ salesRepId: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("dealId client amount progress status");

  res.status(200).json(activity);
};

// @desc    Update/Set Sales Targets
// @route   POST /api/sales/targets
// @access  Private (Manager/Admin or Self?)


// @desc    Get targets and performance
// @route   GET /api/sales/targets
// @access  Private
export const getTargetsData = async (req, res) => {
    const userId = req.user._id;
    const { period } = req.query;
    const currentPeriod = period || 'monthly';
    const currentYear = new Date().getFullYear();

    let individualTarget = await SalesTarget.findOne({
        type: 'individual',
        assignedTo: userId.toString(),
        period: currentPeriod,
        year: currentYear
    });

    if (!individualTarget) {
        individualTarget = {  dealsTarget: 0, clientsTarget: 0 };
    }

    let teamTarget = await SalesTarget.findOne({
        type: 'team',
        assignedTo: 'team',
        period: currentPeriod,
        year: currentYear
    });

    if (!teamTarget) {
        teamTarget = { dealsTarget: 0, clientsTarget: 0 };
    }

    const now = new Date();
    let startDate = new Date(now.getFullYear(), 0, 1);

    if (currentPeriod === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (currentPeriod === 'quarterly') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
    }

    const actualStatsAgg = await Sales.aggregate([
        {
            $match: {
                salesRepId: userId,
                date: { $gte: startDate },
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: "$amount" },
                deals: { $sum: 1 },
            }
        }
    ]);

    const actualDeals = actualStatsAgg.length ? actualStatsAgg[0].deals : 0;

    const actualClientsList = await Sales.distinct('client', {
        salesRepId: userId,
        date: { $gte: startDate }
    });
    const actualClients = actualClientsList.length;

    res.status(200).json({
        individual: {
            target: individualTarget,
            actual: {
                deals: actualDeals,
                clients: actualClients
            }
        },
        team: {
            target: teamTarget,
            actual: { deals: 0, clients: 0 }
        }
    });
};

// @desc    Get historical performance
// @route   GET /api/sales/performance
// @access  Private
export const getPerformanceChart = async (req, res) => {
    const userId = req.user._id;

    const performance = await Sales.aggregate([
        {
            $match: {
                salesRepId: userId,
                status: 'completed',
                date: {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lte: new Date(new Date().getFullYear(), 11, 31)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$date" },
                revenue: { $sum: "$amount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedPerformance = performance.map(item => ({
        month: months[item._id - 1],
        revenue: item.revenue
    }));

    res.status(200).json(formattedPerformance);
};
