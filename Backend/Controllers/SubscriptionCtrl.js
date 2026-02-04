import Subscription from "../Models/SubscriptionModel.js";
import Plan from "../Models/PlanModel.js";
import razorpay from "../Config/razorpay.js";
import crypto from "crypto";

export const createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const { id: adminId } = req.user;

    if (!adminId || !planId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔹 Check plan
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive || plan.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    // 🔹 Check already active subscription
    const activeSubscription = await Subscription.findOne({
      adminId,
      status: "active",
      isDeleted: false,
    });

    if (activeSubscription) {
      return res.status(400).json({
        success: false,
        message: "Your current plan is already active",
      });
    }

    // 🔹 Create Razorpay subscription (auto recurring)
    let razorpaySubscriptionId = null;
    let razorpaySubscriptionUrl = null;

    // Check if this is just a log creation (no payment yet)
    const { isLog } = req.body;

    if (!isLog && plan.planPrice > 0 && plan.razorpayPlanId) {
      const razorpaySubscription = await razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        customer_notify: 1,
        total_count: 12,
      });

      razorpaySubscriptionId = razorpaySubscription.id;
      razorpaySubscriptionUrl = razorpaySubscription.short_url;
    }

    // 🔹 Save in DB
    const subscription = await Subscription.create({
      adminId,
      planId,
      razorpaySubscriptionId,
      razorpaySubscriptionUrl,
      status: "pending", // Always pending initially
      finalPayableAmount: plan.planPrice,
    });

    return res.status(201).json({
      success: true,
      message:
        plan.planPrice > 0
          ? "Subscription created. Complete payment"
          : "Free plan activated",
      subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const upgradeSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const { id: adminId } = req.user;

    // 🔹 Check new plan
    const newPlan = await Plan.findById(planId);
    if (!newPlan || !newPlan.isActive || newPlan.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    // 🔹 Get user's active subscription
    const activeSubscription = await Subscription.findOne({
      adminId,
      status: "active",
      isDeleted: false,
    });

    if (!activeSubscription) {
      return res.status(404).json({
        success: false,
        message: "Active subscription not found",
      });
    }

    // 🔹 Same plan check
    if (activeSubscription.planId.toString() === planId) {
      return res.status(400).json({
        success: false,
        message: "Already on this plan",
      });
    }

    // 🔹 Create Razorpay subscription for new plan
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: newPlan.razorpayPlanId,
      customer_notify: 1,
      total_count: 12,
    });

    // 🔹 Create NEW subscription as pending
    const newSubscription = await Subscription.create({
      adminId,
      planId,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpaySubscriptionUrl: razorpaySubscription.short_url,
      status: "pending",
      finalPayableAmount: newPlan.planPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Upgrade initiated. Please complete payment.",
      subscription: newSubscription,
      paymentUrl: razorpaySubscription.short_url,
    });

  } catch (error) {
    console.log("Upgrade Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ============ GET SUBSCRIPTION OF ADMIN ============ */
export const getSubscriptionByAdmin = async (req, res) => {
  try {
    const { id } = req.user;
    const subscriptions = await Subscription.find({
      adminId: id,
      isDeleted: false,
      status: { $in: ["active", "cancelled"] },
    });
    res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============ GET ALL SUBSCRIPTIONS ============ */
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status } = req.query; // Check for status in query

    let filter = { isDeleted: false };
    if (status) {
      filter.status = status;
    }

    const subscriptions = await Subscription.find(filter)
      .populate("adminId planId")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      message: "Subscriptions fetched successfully",
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============ CANCEL SUBSCRIPTION ============ */
export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription || subscription.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    if (!subscription.razorpaySubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay subscription ID missing",
      });
    }

    // 🔥 Cancel on Razorpay (this triggers webhook event)
    const razorpayResponse = await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId,
    );

    // ⚠️ Webhook will update final status
    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancel initiated",
      razorpay: razorpayResponse,
    });
  } catch (error) {
    console.log("Cancel Subscription Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers["x-razorpay-signature"];

    const body = req.body; // Buffer

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(body.toString());
    const eventType = event.event;

    console.log("Razorpay Event:", eventType);

    /* ================= SUBSCRIPTION ACTIVATED ================= */
    if (eventType === "subscription.activated") {
      const razorpaySubId = event.payload.subscription.entity.id;

      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: razorpaySubId,
      });

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // 🔥 Expire previous cancelled subscription of same admin
      await Subscription.updateMany(
        {
          adminId: subscription.adminId,
          _id: { $ne: subscription._id },
          status: "cancelled",
        },
        { status: "expired" },
      );

      subscription.status = "active";
      subscription.subscriptionDetails = event.payload.subscription.entity;
      subscription.paymentDetails = event.payload.payment?.entity || null;

      await subscription.save();
    }

    /* ================= SUBSCRIPTION CANCELLED ================= */
    if (eventType === "subscription.cancelled") {
      const razorpaySubId = event.payload.subscription.entity.id;

      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: razorpaySubId },
        { status: "cancelled" },
      );
    }

    /* ================= PAYMENT FAILED ================= */
    if (eventType === "payment.failed") {
      const razorpaySubId = event.payload.subscription?.entity?.id;

      if (razorpaySubId) {
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: razorpaySubId },
          { status: "cancelled" },
        );
      }
    }

    /* ================= UPGRADE PAYMENT SUCCESS ================= */
    if (
      eventType === "subscription.charged" ||
      eventType === "payment.captured"
    ) {
      const razorpaySubId = event.payload.subscription?.entity?.id;

      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: razorpaySubId,
      });

      if (!subscription) return res.status(200).json({ success: true });

      // 🔥 Expire old plan ONLY AFTER PAYMENT SUCCESS
      await Subscription.updateMany(
        {
          adminId: subscription.adminId,
          status: "active",
          _id: { $ne: subscription._id },
        },
        { status: "expired" },
      );

      subscription.status = "active";
      subscription.subscriptionDetails = event.payload.subscription?.entity;
      subscription.paymentDetails = event.payload.payment?.entity;

      await subscription.save();
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Webhook Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }

};

// plan upgrde me price galt ja raha a
// subscription lete time url pe actual plan price dikh raha ha 