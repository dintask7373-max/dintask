import Sales from "../../Models/Sales/SalesModel.js";

// @desc    Create a new sale/deal
// @route   POST /api/sales/create
// @access  Private
export const createSale = async (req, res) => {
    try {
        const { client, amount, status, dealStage, date, priority, deadline } = req.body;
        const salesRepId = req.user._id;

        if (!client || !amount) {
            return res.status(400).json({ message: "Client and Amount are required" });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent sales activity
// @route   GET /api/sales/activity
// @access  Private
export const getRecentActivity = async (req, res) => {
    try {
        const userId = req.user._id;

        const activity = await Sales.find({ salesRepId: userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select("dealId client amount progress status");

        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
