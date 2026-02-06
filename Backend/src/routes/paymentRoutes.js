const express = require('express');
const { createOrder, verifyPayment, getBillingHistory, downloadInvoice } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getBillingHistory);
router.get('/invoice/:id', downloadInvoice);

module.exports = router;
