import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const employeeSchema = new mongoose.Schema(
  {
    // Kis manager ke under kaam karta hai
    assignManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },

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

    mobile: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "employee",
    },

    roleName: {
      type: String,
      required: true, // jaise: "Sales Executive", "Customer Support"
    },

    password: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      ref: "Admin",
      // required: true, // Made optional for self-registration
    },
    isWorkspaceVerified: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Employee", employeeSchema);
