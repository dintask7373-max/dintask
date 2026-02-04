import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "admin",
    },
    avatar: {
      type: String,
      default: "",
    },
    inviteCodes: {
      employee: {
        type: String,
        unique: true,
        sparse: true,
      },
      manager: {
        type: String,
        unique: true,
        sparse: true,
      },
      sales: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
  },
  { timestamps: true }
);

// Password hash before save
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Admin", adminSchema);
