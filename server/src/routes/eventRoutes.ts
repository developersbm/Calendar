import { Router } from "express";
import { getEvent, getEvents, postEvent, getEventCalendar } from "../controllers/eventController";

const router = Router();

router.get("/", getEvents);
router.get("/calendar", getEventCalendar);
router.post("/", postEvent);

export default router;