import { Router } from "express";
import { addMemberToGroup, getMembersByGroup, removeMemberFromGroup, updateMemberRoleOrStatus } from "../controllers/groupMemberController";

const router = Router();

router.get("/", getMembersByGroup);
router.get("/", addMemberToGroup);
router.get("/", updateMemberRoleOrStatus);
router.get("/", removeMemberFromGroup);

export default router;