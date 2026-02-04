import SuperAdmin from "../../Models/AuthModel.js";
import { generateToken } from "../../Helpers/generateToken.js";

// ================= LOGIN SUPER ADMIN =================
export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) {
            return res.status(404).json({
                success: false,
                message: "SuperAdmin not found",
                data: null
            });
        }

        const isMatch = await superAdmin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null
            });
        }

        const token = await generateToken(superAdmin._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: superAdmin,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};
