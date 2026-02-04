import express from "express";
import {
    createNote,
    getAllNotes,
    getNotesByEmployee,
    getSingleNote,
    updateNote,
    deleteNote,
} from "../../Controllers/Employee/NotesCtrl.js";
import { EmployeeMiddleware, isEmployee } from "../../Middlewares/EmployeeMiddleware.js";

const router = express.Router();

// Create note
router.post("/create", EmployeeMiddleware, isEmployee, createNote);

// Get all notes
router.get("/all", EmployeeMiddleware, isEmployee, getAllNotes);

// Get notes by employee
router.get("/employeeNotes", EmployeeMiddleware, isEmployee, getNotesByEmployee);

// Get single note
router.get("/:id", EmployeeMiddleware, isEmployee, getSingleNote);

// Update note
router.put("/editNotes/:id", EmployeeMiddleware, isEmployee, updateNote);

// Delete note
router.delete("/deleteNotes/:id", EmployeeMiddleware, isEmployee, deleteNote);

export default router;
