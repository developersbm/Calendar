import { Router } from "express";
import { getGroup, getGroups, postGroup } from "../controllers/groupController";

const router = Router();

router.get("/", getGroups);
router.get("/", getGroup);
router.get("/", postGroup);

export default router;