import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all celebration plans for a specific user
export const getCelebrationPlansByUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    
    try {
        const plans = await prisma.celebrationPlan.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "desc" },
        });
        res.json(plans);
    } catch (error: any) {
        console.error("Error fetching celebration plans:", error);
        res.status(500).json({ message: `Error fetching celebration plans: ${error.message}` });
    }
};

// Get a specific celebration plan by ID
export const getCelebrationPlanById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const plan = await prisma.celebrationPlan.findUnique({ where: { id: Number(id) } });
        if (!plan) {
             res.status(404).json({ message: "Celebration plan not found" });
        }
        res.json(plan);
    } catch (error: any) {
        console.error("Error fetching celebration plan:", error);
        res.status(500).json({ message: `Error fetching celebration plan: ${error.message}` });
    }
};

// Create a new celebration plan
export const createCelebrationPlan = async (req: Request, res: Response): Promise<void> => {
    const { title, description, userId, date, budget } = req.body;
    
    if (!title || !userId) {
         res.status(400).json({ message: "Title and userId are required." });
    }
    
    try {
        const plan = await prisma.celebrationPlan.create({
            data: { title, description, userId: Number(userId), date, budget },
        });
        res.status(201).json(plan);
    } catch (error: any) {
        console.error("Error creating celebration plan:", error);
        res.status(500).json({ message: `Error creating celebration plan: ${error.message}` });
    }
};

// Update a celebration plan
export const updateCelebrationPlan = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, date, budget } = req.body;
    
    try {
        const plan = await prisma.celebrationPlan.update({
            where: { id: Number(id) },
            data: { title, description, date, budget },
        });
        res.json(plan);
    } catch (error: any) {
        console.error("Error updating celebration plan:", error);
        res.status(500).json({ message: `Error updating celebration plan: ${error.message}` });
    }
};

// Delete a celebration plan
export const deleteCelebrationPlan = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        await prisma.celebrationPlan.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Celebration plan deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting celebration plan:", error);
        res.status(500).json({ message: `Error deleting celebration plan: ${error.message}` });
    }
};