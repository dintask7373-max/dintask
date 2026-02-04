import Event from "../../Models/EventModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Manager from "../../Models/ManagerModel.js";

export const getEmployeeEvents = async (req, res) => {
    try {
        const { id } = req.user; // employee id
        const { type } = req.query;

        let startDate, endDate;
        const now = new Date();

        if (type === "today") {
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
        }

        if (type === "week") {
            const firstDay = now.getDate() - now.getDay();
            startDate = new Date(now.setDate(firstDay));
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }

        if (type === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        // ✅ Manager should see only events where he is participant
        let filter = {
            participants: id
        };

        if (type) {
            filter.startTime = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const events = await Event.find(filter)
            .sort({ startTime: 1 })
            .populate("adminId", "ownerName email companyName");

        /* ================= Resolve Participants ================= */

        const participantIds = events.flatMap(event => event.participants);

        const employees = await Employee.find(
            { _id: { $in: participantIds } },
            "fullName email avatar roleName"
        );

        const managers = await Manager.find(
            { _id: { $in: participantIds } },
            "fullName email avatar"
        );

        const allParticipants = [...employees, ...managers];

        const participantMap = {};
        allParticipants.forEach(p => {
            participantMap[p._id.toString()] = p;
        });

        const finalEvents = events.map(event => {
            const eventObj = event.toObject();

            eventObj.participants = event.participants.map(pid => {
                return participantMap[pid.toString()] || {
                    _id: pid,
                    fullName: "Unknown"
                };
            });

            return eventObj;
        });

        res.json({
            success: true,
            count: finalEvents.length,
            events: finalEvents,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
