import express from "express";
import {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    deleteTask,
    changeTaskStatus
} from "../../Controllers/Admin/TaskCtrl.js";
import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";

const router = express.Router();

router.post("/createTask", AdminMiddleware, isAdmin, createTask);
router.get("/getAllTasks", AdminMiddleware, isAdmin, getAllTasks);
router.get("/getSingleTask/:id", AdminMiddleware, isAdmin, getSingleTask);
router.put("/editTask/:id", AdminMiddleware, isAdmin, updateTask);
router.delete("/deleteTask/:id", AdminMiddleware, isAdmin, deleteTask);
router.patch("/changeTaskStatus/:id", AdminMiddleware, isAdmin, changeTaskStatus);

export default router;
