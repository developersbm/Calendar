import { Router } from "express";
import { getGroup, getGroups, postGroup, deleteGroup } from "../controllers/groupController";

const router = Router();

router.get("/", getGroups);
router.get("/", getGroup);
router.post("/", postGroup);
router.delete("/:groupId", deleteGroup);

export default router;