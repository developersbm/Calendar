import express from "express";
import { 
    getCelebrationPlansByUser,
    getCelebrationPlanById,
    createCelebrationPlan,
    updateCelebrationPlan,
    deleteCelebrationPlan 
} from '../controllers/creatingPlanController';

const router = express.Router();

router.get("/user/:userId", getCelebrationPlansByUser);
router.get("/:id", getCelebrationPlanById);
router.post("/", createCelebrationPlan);
router.put("/:id", updateCelebrationPlan);
router.delete("/:id", deleteCelebrationPlan);

export default router;
