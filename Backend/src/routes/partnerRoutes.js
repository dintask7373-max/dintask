const express = require('express');
const {
    getPartners,
    getPartner,
    updatePartnerStatus,
    updatePartnerCommission,
    getPartnerDashboard,
    getPartnerPayouts,
    createPayout,
    getPartnerDocuments,
    getPartnerReferrals,
    getPartnerTransactions,
    getPartnerAnalytics,
    submitAgreement,
    shareReferralLink
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`[PARTNER_DEBUG] ${req.method} ${req.originalUrl} | Path: ${req.url}`);
    next();
});

// 1. Health check (No auth)
router.get('/health-check', (req, res) => {
    console.log('[PARTNER_DEBUG] Hit health-check');
    res.json({ success: true, message: 'Partner Router is alive' });
});

// 2. Partner Specific Routes (Auth)
router.get('/dashboard/stats', protect, authorize('partner'), getPartnerDashboard);
router.get('/my-payouts', protect, authorize('partner'), getPartnerPayouts);
router.put('/agreement/submit', protect, authorize('partner'), submitAgreement);
router.post('/share-link', protect, authorize('partner'), shareReferralLink);

// 3. SuperAdmin Specific Routes (Auth)
router.get('/history/:id', protect, authorize('superadmin'), (req, res, next) => {
    console.log('[PARTNER_DEBUG] Hit history route for ID:', req.params.id);
    if (typeof getPartnerTransactions !== 'function') {
        return res.status(500).json({ success: false, error: 'getPartnerTransactions is not a function' });
    }
    getPartnerTransactions(req, res, next);
});

router.get('/documents/:id', protect, authorize('superadmin'), getPartnerDocuments);
router.get('/referrals/:id', protect, authorize('superadmin'), getPartnerReferrals);
router.get('/analytics/:id', protect, authorize('superadmin'), getPartnerAnalytics);

// 4. Base Routes (Put these last to avoid capturing other specific paths)
router.get('/', protect, authorize('superadmin', 'superadmin_staff'), getPartners);
router.get('/:id', protect, authorize('superadmin', 'partner'), getPartner);
router.put('/:id/status', protect, authorize('superadmin'), updatePartnerStatus);
router.put('/:id/commission', protect, authorize('superadmin'), updatePartnerCommission);
router.post('/payouts', protect, authorize('superadmin'), createPayout);

module.exports = router;
