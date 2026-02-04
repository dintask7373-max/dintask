import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const salesUserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        mobile: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        // Linking to Admin/Company is still good practice for hierarchy, even if self-registered
        // Linking to Manager
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager",
            // required: true, // Made optional for invite flow
        },
        role: {
            type: String,
            default: "sales",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        isWorkspaceVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Password hash before save
salesUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
salesUserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("SalesUser", salesUserSchema);
