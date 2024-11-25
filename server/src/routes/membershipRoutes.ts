import { Router } from "express";
import { createMembership, getMemberships } from "../controllers/membershipController";

const router = Router();

router.get("/", getMemberships);
router.get("/", createMembership);

export default router;