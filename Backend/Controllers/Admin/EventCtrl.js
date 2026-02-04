import Event from "../../Models/EventModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Manager from "../../Models/ManagerModel.js";

/* ================= CREATE EVENT ================= */
export const createEvent = async (req, res) => {
    try {
        const { id } = req.user;
        const { eventName, eventDate, startTime, endTime, location, participants } = req.body;

        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({
                success: false,
                message: "End time must be greater than start time",
            });
        }

        const event = await Event.create({
            eventName,
            eventDate,
            startTime,
            endTime,
            location,
            participants,
            adminId: id
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= UPDATE EVENT ================= */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event)
            return res.status(404).json({ success: false, message: "Event not found" });

        Object.assign(event, req.body);

        if (event.endTime <= event.startTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be greater than start time",
            });
        }

        await event.save();

        res.json({
            success: true,
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DELETE EVENT ================= */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);
        if (!event)
            return res.status(404).json({ success: false, message: "Event not found" });

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GET SINGLE EVENT ================= */
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event)
            return res.status(404).json({ success: false, message: "Event not found" });

        res.json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getEvents = async (req, res) => {
    try {
        const { id } = req.user;
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

        let filter = { adminId: id };

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

        // Collect all participant IDs
        const participantIds = events.flatMap(event => event.participants);

        // Find in Employee
        const employees = await Employee.find(
            { _id: { $in: participantIds } },
            "fullName email"
        );

        // Find in Manager
        const managers = await Manager.find(
            { _id: { $in: participantIds } },
            "fullName email"
        );

        // Merge both
        const allParticipants = [...employees, ...managers];

        // Map for fast lookup
        const participantMap = {};
        allParticipants.forEach(p => {
            participantMap[p._id.toString()] = p;
        });

        // Replace IDs with user objects
        const finalEvents = events.map(event => {
            const eventObj = event.toObject();

            eventObj.participants = event.participants.map(pid => {
                return participantMap[pid.toString()] || { _id: pid, fullName: "Unknown" };
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
