import { Router } from "express";
import { addMemberToGroup, getAllMembers, getMembersByGroup, removeMemberFromGroup, updateMemberRoleOrStatus } from "../controllers/groupMemberController";

const router = Router();

router.get("/", getAllMembers);
router.get("/", getMembersByGroup);
router.get("/", addMemberToGroup);
router.get("/", updateMemberRoleOrStatus);
router.get("/", removeMemberFromGroup);

export default router;