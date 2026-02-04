import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const managerSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      // required: true, // Made optional for invite flow
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
    },

    department: {
      type: String,
      required: true,
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
    role: {
      type: String,
      default: "manager",
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

export default mongoose.model("Manager", managerSchema);
