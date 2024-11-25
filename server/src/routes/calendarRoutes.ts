import { Router } from "express";
import { getCalendar, getCalendars, postCalendar } from "../controllers/calendarController";

const router = Router();

router.get("/", getCalendars);
router.get("/", getCalendar);
router.get("/", postCalendar);

export default router;