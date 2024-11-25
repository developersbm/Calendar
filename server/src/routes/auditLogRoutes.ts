import { Router } from "express";
import { createAuditLog, getAuditLogsByUser } from "../controllers/auditLogController";

const router = Router();

router.get("/", getAuditLogsByUser);
router.get("/", createAuditLog);

export default router;