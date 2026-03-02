const mongoose = require('mongoose');
const Partner = require('../models/Partner');
const PartnerCommission = require('../models/PartnerCommission');
const PartnerPayout = require('../models/PartnerPayout');
const PartnerDocument = require('../models/PartnerDocument');
const Admin = require('../models/Admin');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Get all partners (SuperAdmin)
// @route   GET /api/v1/partners
// @access  Private/SuperAdmin
exports.getPartners = async (req, res, next) => {
    try {
        const partners = await Partner.find().sort('-createdAt');
        res.status(200).json({ success: true, count: partners.length, data: partners });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single partner
// @route   GET /api/v1/partners/:id
// @access  Private
exports.getPartner = async (req, res, next) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) {
            return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: partner });
    } catch (err) {
        next(err);
    }
};

// @desc    Update partner status (Approve/Reject)
// @route   PUT /api/v1/partners/:id/status
// @access  Private/SuperAdmin
exports.updatePartnerStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        let partner = await Partner.findById(req.params.id);

        if (!partner) {
            return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
        }

        if (status === 'active' && !partner.referralCode) {
            // Generate sequential referral code
            const lastPartner = await Partner.findOne({ referralCode: { $exists: true } }).sort('-createdAt');
            let nextNum = 1;
            if (lastPartner && lastPartner.referralCode) {
                const lastNum = parseInt(lastPartner.referralCode.replace('CP', ''));
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            partner.referralCode = 'CP' + nextNum.toString().padStart(3, '0');
        }

        partner.status = status;
        await partner.save();

        res.status(200).json({ success: true, data: partner });
    } catch (err) {
        next(err);
    }
};

// @desc    Update partner commission settings
// @route   PUT /api/v1/partners/:id/commission
// @access  Private/SuperAdmin
exports.updatePartnerCommission = async (req, res, next) => {
    try {
        const { commissionType, commissionValue } = req.body;
        let partner = await Partner.findById(req.params.id);

        if (!partner) {
            return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
        }

        partner.commissionType = commissionType;
        partner.commissionValue = commissionValue;
        await partner.save();

        res.status(200).json({ success: true, data: partner });
    } catch (err) {
        next(err);
    }
};

// @desc    Accept Partner Agreement
// @route   PUT /api/v1/partners/agreement/accept
// @access  Private/Partner
exports.acceptAgreement = async (req, res, next) => {
    try {
        const partner = await Partner.findById(req.user.id);
        if (!partner) return next(new ErrorResponse('Partner not found', 404));

        partner.agreementStatus = 'accepted';
        partner.agreementAcceptedAt = Date.now();
        await partner.save();

        res.status(200).json({ success: true, data: partner });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Partner Dashboard Stats
// @route   GET /api/v1/partners/dashboard/stats
// @access  Private/Partner
exports.getPartnerDashboard = async (req, res, next) => {
    try {
        const partnerId = req.user.id;
        const partner = await Partner.findById(partnerId);

        // Total Referred Clients (Converted)
        const convertedStats = await Admin.countDocuments({ partnerId });

        // Commission Stats
        const commissions = await PartnerCommission.find({ partnerId });
        const totalCommissionEarned = commissions.reduce((acc, curr) => acc + curr.amount, 0);
        const pendingCommission = commissions.filter(c => c.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
        const paidCommission = commissions.filter(c => c.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

        // Recent Commissions
        const recentCommissions = await PartnerCommission.find({ partnerId })
            .populate('adminId', 'name companyName')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalEarnings: totalCommissionEarned,
                pendingCommission,
                paidCommission,
                convertedClients: convertedStats,
                recentCommissions,
                referralCode: partner.referralCode,
                agreementStatus: partner.agreementStatus
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Partner Payouts
// @route   GET /api/v1/partners/payouts
// @access  Private/Partner
exports.getPartnerPayouts = async (req, res, next) => {
    try {
        const payouts = await PartnerPayout.find({ partnerId: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: payouts });
    } catch (err) {
        next(err);
    }
};

// @desc    Create Payout (SuperAdmin release)
// @route   POST /api/v1/partners/payouts
// @access  Private/SuperAdmin
exports.createPayout = async (req, res, next) => {
    try {
        const { partnerId, amount, transactionRef, commissionIds } = req.body;

        const partner = await Partner.findById(partnerId);
        if (!partner) return next(new ErrorResponse('Partner not found', 404));

        // Create payout record
        const payout = await PartnerPayout.create({
            partnerId,
            amount,
            transactionRef,
            status: 'paid'
        });

        // Update commissions - if commissionIds is empty, fetch all pending ones for this partner
        let finalCommissionIds = commissionIds;
        if (!finalCommissionIds || finalCommissionIds.length === 0) {
            const pendingCommissions = await PartnerCommission.find({ partnerId, status: 'pending' }).select('_id');
            finalCommissionIds = pendingCommissions.map(c => c._id);
        }

        await PartnerCommission.updateMany(
            { _id: { $in: finalCommissionIds } },
            { status: 'paid', payoutId: payout._id }
        );

        // Update partner stats
        partner.pendingCommission -= amount;
        partner.paidCommission += amount;
        await partner.save();

        res.status(201).json({ success: true, data: payout });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Partner Documents
// @route   GET /api/v1/partners/:id/documents
// @access  Private/SuperAdmin
exports.getPartnerDocuments = async (req, res, next) => {
    console.log('getPartnerDocuments hit for ID:', req.params.id);
    try {
        const documents = await PartnerDocument.find({ partnerId: req.params.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        next(err);
    }
};

// @desc    Share Referral Link via Email
// @route   POST /api/v1/partners/share-link
// @access  Private/Partner
exports.shareReferralLink = async (req, res, next) => {
    try {
        const { clientEmail } = req.body;
        const partner = await Partner.findById(req.user.id);

        if (!partner) return next(new ErrorResponse('Partner not found', 404));
        if (partner.agreementStatus !== 'accepted') {
            return next(new ErrorResponse('Please accept the agreement before sharing links', 400));
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralLink = `${frontendUrl}/admin/register?ref=${partner.referralCode}`;

        const message = `Hello,\n\nYou have been invited to join DinTask by ${partner.fullName || partner.companyName}.\n\nDinTask is a powerful SaaS platform designed to streamline your business operations.\n\nClick the link below to register and get started with your account:\n${referralLink}\n\nBest regards,\nDinTask Team`;

        await sendEmail({
            email: clientEmail,
            subject: 'Special Invitation to join DinTask',
            message
        });

        res.status(200).json({ success: true, message: 'Referral link shared successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Partner Referrals (referred clients)
// @route   GET /api/v1/partners/:id/referrals
// @access  Private/SuperAdmin
exports.getPartnerReferrals = async (req, res, next) => {
    try {
        const referrals = await Admin.find({ partnerId: req.params.id })
            .select('name companyName email status createdAt')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: referrals.length,
            data: referrals
        });
    } catch (err) {
        next(err);
    }
};
// @desc    Get Partner Transactions (commission history)
// @route   GET /api/v1/partners/:id/transactions
// @access  Private/SuperAdmin
exports.getPartnerTransactions = async (req, res, next) => {
    console.log('[DEBUG] getPartnerTransactions called for partnerId:', req.params.id);
    try {
        const commissions = await PartnerCommission.find({ partnerId: req.params.id })
            .populate('adminId', 'name companyName email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: commissions.length,
            data: commissions
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Partner Analytics (for charts)
// @route   GET /api/v1/partners/analytics/:id
// @access  Private/SuperAdmin
exports.getPartnerAnalytics = async (req, res, next) => {
    try {
        const partnerId = req.params.id;
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        // Aggregate Referrals by month
        const referralStats = await Admin.aggregate([
            {
                $match: {
                    partnerId: new mongoose.Types.ObjectId(partnerId),
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Aggregate Commissions by month
        const commissionStats = await PartnerCommission.aggregate([
            {
                $match: {
                    partnerId: new mongoose.Types.ObjectId(partnerId),
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Merge and Format for Recharts
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(twelveMonthsAgo);
            date.setMonth(date.getMonth() + i);
            const m = date.getMonth() + 1;
            const y = date.getFullYear();

            const ref = referralStats.find(s => s._id.month === m && s._id.year === y);
            const comm = commissionStats.find(s => s._id.month === m && s._id.year === y);

            chartData.push({
                name: `${months[m - 1]} ${y}`,
                referrals: ref ? ref.count : 0,
                earnings: comm ? comm.amount : 0
            });
        }

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (err) {
        next(err);
    }
};
