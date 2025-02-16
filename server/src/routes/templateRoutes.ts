import { Router } from "express";
import { createTemplate, deleteTemplate, getTemplatesByUser, getTemplateById, updateTemplate } from "../controllers/templateController";

const router = Router();

router.get("/user/:userId", getTemplatesByUser);
router.get("/:id", getTemplateById);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;