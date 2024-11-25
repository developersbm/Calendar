import { Router } from "express";
import { addParticipantToEvent, getParticipantsByEvent, removeParticipantFromEvent, updateParticipantStatus } from "../controllers/eventParticipantController";

const router = Router();

router.get("/", getParticipantsByEvent);
router.get("/", addParticipantToEvent);
router.get("/", updateParticipantStatus);
router.get("/", removeParticipantFromEvent);

export default router;