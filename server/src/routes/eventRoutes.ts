import { Router } from "express";
import { getEvents, postEvent, getEventCalendar, deleteEvent, updateEvent } from "../controllers/eventController";

const router = Router();

router.get("/", getEvents);
router.get("/calendar", getEventCalendar);
router.post("/", postEvent);
router.delete("/:id", deleteEvent);
router.put("/:id", updateEvent);

export default router;