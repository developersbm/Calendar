import express from "express";
import { 
    getCelebrationPlansByUser,
    getCelebrationPlanById,
    createCelebrationPlan,
    deleteCelebrationPlan 
} from '../controllers/celebrationPlanController';

const router = express.Router();

router.get("/user/:userId", getCelebrationPlansByUser);
router.get("/:id", getCelebrationPlanById);
router.post("/", createCelebrationPlan);
router.delete("/:id", deleteCelebrationPlan);

export default router;
