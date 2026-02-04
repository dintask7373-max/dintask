import express from "express";
import {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEvents
} from "../../Controllers/Admin/EventCtrl.js";
import { AdminMiddleware, isAdmin } from "../../Middlewares/AdminMiddleware.js";

const router = express.Router();

router.post("/createEvent", AdminMiddleware, isAdmin, createEvent);
router.put("/updateEvent/:id", AdminMiddleware, isAdmin, updateEvent);
router.delete("/deleteEvent/:id", AdminMiddleware, isAdmin, deleteEvent);
router.get("/getEventById/:id", AdminMiddleware, isAdmin, getEventById);
router.get("/getEvents", AdminMiddleware, isAdmin, getEvents);

export default router;
