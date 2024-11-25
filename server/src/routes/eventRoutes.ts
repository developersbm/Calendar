import { Router } from "express";
import { getEvent, getEvents, postEvent } from "../controllers/eventController";

const router = Router();

router.get("/", getEvents);
router.get("/", getEvent);
router.get("/", postEvent);

export default router;