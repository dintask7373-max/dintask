import Sales from "../../Models/Sales/SalesModel.js";
import SalesTarget from "../../Models/Sales/SalesTargetModel.js";

// @desc    Get dashboard stats
// @route   GET /api/sales/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get targets and performance
// @route   GET /api/sales/targets
// @access  Private
export const getTargetsData = async (req, res) => {
    try {
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
            individualTarget = { dealsTarget: 0, clientsTarget: 0 };
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get historical performance
// @route   GET /api/sales/performance
// @access  Private
export const getPerformanceChart = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
