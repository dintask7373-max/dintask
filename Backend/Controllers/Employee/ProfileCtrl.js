import Employee from "../../Models/EmployeeModel.js";

export const changeStatus = async (req, res) => {
    try {
        const { id } = req.user;
        const { isActive } = req.body;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null,
            });
        }

        employee.isActive = isActive;
        await employee.save();

        res.status(200).json({
            success: true,
            message: "Status changed successfully",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};
