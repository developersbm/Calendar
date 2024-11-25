import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all templates
export const getAllTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        const templates = await prisma.template.findMany();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching templates: ${error.message}` });
    }
};

// Get a template by ID
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const template = await prisma.template.findUnique({ where: { id: Number(id) } });
        if (!template) {
            res.status(404).json({ message: "Template not found" });
        }
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching template: ${error.message}` });
    }
};

// Create a new template
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
    const { title, description, ownerId, elements } = req.body;
    try {
        const template = await prisma.template.create({
            data: { title, description, ownerId, elements },
        });
        res.status(201).json({ message: "Template created successfully", template });
    } catch (error: any) {
        res.status(500).json({ message: `Error creating template: ${error.message}` });
    }
};

// Update a template
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        const template = await prisma.template.update({
            where: { id: Number(id) },
            data: { title, description, isActive },
        });
        res.json({ message: "Template updated successfully", template });
    } catch (error: any) {
        res.status(500).json({ message: `Error updating template: ${error.message}` });
    }
};

// Delete a template
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.template.delete({ where: { id: Number(id) } });
        res.json({ message: "Template deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: `Error deleting template: ${error.message}` });
    }
};