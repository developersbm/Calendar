import { Router } from "express";
import { createTemplate, deleteTemplate, getAllTemplates, getTemplateById, updateTemplate } from "../controllers/templateController";

const router = Router();

router.get("/", getAllTemplates);
router.get("/", getTemplateById);
router.get("/", createTemplate);
router.get("/", updateTemplate);
router.get("/", deleteTemplate);

export default router;