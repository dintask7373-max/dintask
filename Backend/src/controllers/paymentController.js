const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Admin = require('../models/Admin');
const Plan = require('../models/Plan');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/create-order
// @access  Private (Admin)
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    if (plan.price === 0) {
      // Free plan - update directly
      const admin = await Admin.findById(req.user.id);
      admin.subscriptionPlan = plan.name;
      admin.subscriptionPlanId = plan._id;
      admin.subscriptionStatus = 'active';
      admin.subscriptionExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      await admin.save();

      return res.status(200).json({
        success: true,
        message: 'Free plan activated successfully',
        free: true
      });
    }

    const options = {
      amount: plan.price * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, error: 'Failed to create Razorpay order' });
    }

    // Save initial payment record
    await Payment.create({
      adminId: req.user.id,
      planId,
      razorpayOrderId: order.id,
      amount: plan.price,
      status: 'created'
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify Payment
// @route   POST /api/v1/payments/verify
// @access  Private (Admin)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment record not found' });
      }

      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'paid';
      await payment.save();

      // Update Admin's plan
      const plan = await Plan.findById(payment.planId);
      const admin = await Admin.findById(payment.adminId);

      if (admin && plan) {
        admin.subscriptionPlan = plan.name;
        admin.subscriptionPlanId = plan._id;
        admin.subscriptionStatus = 'active';

        // Calculate expiry based on plan duration
        const expiryDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
        admin.subscriptionExpiry = expiryDate;

        await admin.save();
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and plan updated successfully'
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get billing history
// @route   GET /api/v1/payments/history
// @access  Private (Admin)
exports.getBillingHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ adminId: req.user.id })
      .populate('planId', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const PDFDocument = require('pdfkit');

// @desc    Download invoice
// @route   GET /api/v1/payments/invoice/:id
// @access  Private (Admin)
exports.downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('planId')
      .populate('adminId');

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Verify ownership
    if (payment.adminId._id.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to download this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${payment.razorpayOrderId}.pdf`);
    doc.pipe(res);

    // Header
    doc.fillColor('#2563eb').fontSize(24).text('DinTask CRM', 50, 50);
    doc.fillColor('#444444').fontSize(10).text('INVOICE / RECEIPT', 400, 50, { align: 'right' });
    doc.moveDown();

    // Company Info
    doc.fontSize(10).fillColor('#000000').text('DinTask Solutions Pvt Ltd', 50, 80);
    doc.text('123 Business Avenue, Suite 101', 50, 95);
    doc.text('New Delhi, India, 110001', 50, 110);
    doc.text('GSTIN: 29ABCDE1234F1Z5', 50, 125);

    // Billing To
    doc.fontSize(10).fillColor('#2563eb').text('BILL TO:', 50, 160);
    doc.fillColor('#000000').text(payment.adminId.name, 50, 175);
    doc.text(payment.adminId.companyName, 50, 190);
    doc.text(payment.adminId.email, 50, 205);

    // Invoice Details
    doc.fillColor('#2563eb').text('INVOICE DETAILS:', 400, 160, { align: 'right' });
    doc.fillColor('#000000').text(`Invoice Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 400, 175, { align: 'right' });
    doc.text(`Order ID: ${payment.razorpayOrderId}`, 400, 190, { align: 'right' });
    doc.text(`Transaction ID: ${payment.razorpayPaymentId || 'N/A'}`, 400, 205, { align: 'right' });
    doc.text(`Status: ${payment.status.toUpperCase()}`, 400, 220, { align: 'right' });

    // Table Header
    doc.rect(50, 260, 500, 20).fill('#f8fafc');
    doc.fillColor('#2563eb').fontSize(10).text('DESCRIPTION', 60, 265);
    doc.text('UNIT PRICE', 300, 265);
    doc.text('QTY', 400, 265);
    doc.text('TOTAL', 480, 265);

    // Table Content
    const planName = payment.planId?.name || 'Subscription Plan';
    doc.fillColor('#000000').text(planName, 60, 290);
    doc.text(`INR ${payment.amount}`, 300, 290);
    doc.text('1', 400, 290);
    doc.text(`INR ${payment.amount}`, 480, 290);

    // Horizontal Line
    doc.moveTo(50, 310).lineTo(550, 310).stroke('#e2e8f0');

    // Totals
    doc.fontSize(12).fillColor('#2563eb').text('TOTAL AMOUNT:', 350, 330);
    doc.fillColor('#000000').text(`INR ${payment.amount}`, 480, 330);

    // Footer
    doc.fontSize(10).fillColor('#94a3b8').text('This is a computer-generated document and does not require a signature.', 50, 600, { align: 'center' });
    doc.text('Thank you for choosing DinTask!', 50, 615, { align: 'center' });

    doc.end();

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
