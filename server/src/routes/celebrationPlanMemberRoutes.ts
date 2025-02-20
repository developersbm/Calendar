import { Router } from "express";
import {
  getAllCelebrationPlanMembers,
  getMembersByCelebrationPlan,
  addCelebrationPlanMember,
  updateCelebrationPlanMember,
  removeCelebrationPlanMember
} from "../controllers/celebrationPlanMemberController";

const router = Router();

router.get("/", getAllCelebrationPlanMembers);
router.get("/:planId/members", getMembersByCelebrationPlan);
router.post("/add-member", addCelebrationPlanMember);
router.put("/:planId/:userId", updateCelebrationPlanMember);
router.delete("/:planId/:userId", removeCelebrationPlanMember);

export default router;