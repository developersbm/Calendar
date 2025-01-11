import { Router } from "express";
import { getEvent, getEvents, postEvent } from "../controllers/eventController";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", postEvent);

export default router;