import { Router } from "express";
import { getEvents, postEvent, getEventCalendar, deleteEvent } from "../controllers/eventController";

const router = Router();

router.get("/", getEvents);
router.get("/calendar", getEventCalendar);
router.post("/", postEvent);
router.delete("/:id", deleteEvent);

export default router;