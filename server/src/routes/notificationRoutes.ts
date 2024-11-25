import { Router } from "express";
import { markNotificationAsRead } from "../controllers/notificationController";

const router = Router();

router.get("/", markNotificationAsRead);

export default router;