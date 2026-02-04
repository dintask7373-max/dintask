import Notes from "../../Models/NotesModel.js";

// ================= CREATE NOTE =================
export const createNote = async (req, res) => {
    try {
        const { title, category, content } = req.body;

        const { id } = req.user;
        if (!title || !category || !content || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const note = await Notes.create({
            title,
            category,
            content,
            employeeId: id,
        });

        res.status(201).json({
            success: true,
            message: "Note created successfully",
            note,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET ALL NOTES =================
export const getAllNotes = async (req, res) => {
    try {
        const notes = await Notes.find().populate("employeeId", "name email");

        res.status(200).json({
            success: true,
            count: notes.length,
            notes,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET NOTES BY EMPLOYEE =================
export const getNotesByEmployee = async (req, res) => {
    try {
        const { id } = req.user;

        const notes = await Notes.find({ employeeId: id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notes.length,
            notes,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET SINGLE NOTE =================
export const getSingleNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Notes.findById(id).populate("employeeId", "name email");

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        res.status(200).json({
            success: true,
            note,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= UPDATE NOTE =================
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        const note = await Notes.findById(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        note.title = title ?? note.title;
        note.category = category ?? note.category;
        note.content = content ?? note.content;

        await note.save();

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= DELETE NOTE =================
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Notes.findById(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        await note.deleteOne();

        res.status(200).json({
            success: true,
            message: "Note deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
