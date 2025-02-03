import { Router } from "express";
import { addMember, getAllMembers, getMembersByGroup, removeMemberFromGroup, updateMemberRoleOrStatus } from "../controllers/groupMemberController";

const router = Router();

router.get("/", getAllMembers);
router.get("/", getMembersByGroup);
router.post("/add-member", addMember);
router.get("/", updateMemberRoleOrStatus);
router.get("/", removeMemberFromGroup);

export default router;