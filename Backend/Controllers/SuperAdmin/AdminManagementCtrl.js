import Admin from "../../Models/AdminModel.js";
import Subscription from "../../Models/SubscriptionModel.js";
import { uploadToCloudinary } from "../../Cloudinary/CloudinaryHelper.js";

// ================= GET ALL ADMINS =================
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ isDeleted: false });

        // 🔹 Fetch active subscription for each admin
        const adminsWithSubscription = await Promise.all(
            admins.map(async (admin) => {
                const activeSub = await Subscription.findOne({
                    adminId: admin._id,
                    status: "active",
                    isDeleted: false,
                }).populate("planId");

                return {
                    ...admin.toObject(),
                    activeSubscription: activeSub || null,
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Admins fetched successfully",
            data: adminsWithSubscription,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= GET SINGLE ADMIN =================
export const getSingleAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findOne({ _id: id, isDeleted: false });
        if (!admin)
            return res.status(404).json({ success: false, message: "Admin not found", data: null });

        // 🔹 Fetch active subscription
        const activeSub = await Subscription.findOne({
            adminId: admin._id,
            status: "active",
            isDeleted: false,
        }).populate("planId");

        res.status(200).json({
            success: true,
            message: "Admin fetched successfully",
            data: {
                ...admin.toObject(),
                activeSubscription: activeSub || null,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= UPDATE ADMIN =================
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerName, email, companyName } = req.body;

        const admin = await Admin.findById(id, { isDeleted: false });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

        admin.ownerName = ownerName ?? admin.ownerName;
        admin.email = email ?? admin.email;
        admin.companyName = companyName ?? admin.companyName;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                "admin_avatars"
            );
            admin.avatar = uploadResult.url;
        }
        await admin.save();
        res.status(200).json({ success: true, message: "Admin updated successfully", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= DELETE ADMIN (Soft Delete) =================
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findById(id, { isDeleted: false });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

        admin.isDeleted = true;
        await admin.save();

        res.status(200).json({ success: true, message: "Admin deleted successfully", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= CHANGE STATUS =================
export const changeAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const admin = await Admin.findById(id, { isDeleted: false });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

        admin.status = status ?? admin.status;
        await admin.save();

        res.status(200).json({ success: true, message: "Admin status updated", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};
