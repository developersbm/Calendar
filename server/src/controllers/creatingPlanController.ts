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
    try {
        const { title, description = "{}", userId, startTime, endTime, budget = 0, venue, food, decorator, entertainment } = req.body;

        if (!title || !startTime || !endTime || !userId) {
            res.status(400).json({ message: "Title, startTime, endTime, and userId are required." });
            return;
        }

        const createData: any = {
            title,
            description,
            userId: Number(userId),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            budget,
        };

        // Conditionally create related entities if they exist in the request
        if (venue?.name) {
            const createdVenue = await prisma.venue.create({ data: venue });
            createData.venueId = createdVenue.id;
        }

        if (food?.type) {
            const createdFood = await prisma.food.create({ data: food });
            createData.foodId = createdFood.id;
        }

        if (decorator?.name) {
            const createdDecorator = await prisma.decorator.create({ data: decorator });
            createData.decoratorId = createdDecorator.id;
        }

        if (entertainment?.name) {
            const createdEntertainment = await prisma.entertainment.create({ data: entertainment });
            createData.entertainmentId = createdEntertainment.id;
        }

        const plan = await prisma.celebrationPlan.create({
            data: createData,
            include: {
                venue: true,
                food: true,
                decorator: true,
                entertainment: true,
            },
        });

        // Add the creator as a member with the role of 'Organizer'
        await prisma.celebrationPlanMember.create({
            data: {
                planId: plan.id,
                userId: Number(userId),
                role: "Organizer",
                status: "Accepted",
            },
        });

        res.status(201).json(plan);
    } catch (error: any) {
        console.error("Error creating celebration plan:", error);
        res.status(500).json({ message: `Error creating celebration plan: ${error.message}` });
    }
};

// Delete a celebration plan
export const deleteCelebrationPlan = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const planId = Number(id);

        // Check if the plan exists
        const plan = await prisma.celebrationPlan.findUnique({
            where: { id: planId },
            include: {
                venue: true,
                food: true,
                decorator: true,
                entertainment: true,
                members: true, // CelebrationPlanMember relationships
            },
        });

        if (!plan) {
            res.status(404).json({ message: "Celebration plan not found" });
            return;
        }

        // Delete related members (many-to-many)
        await prisma.celebrationPlanMember.deleteMany({
            where: { planId: planId },
        });

        // Delete related entities if they exist
        if (plan.venueId) {
            await prisma.venue.delete({ where: { id: plan.venueId } });
        }
        if (plan.foodId) {
            await prisma.food.delete({ where: { id: plan.foodId } });
        }
        if (plan.decoratorId) {
            await prisma.decorator.delete({ where: { id: plan.decoratorId } });
        }
        if (plan.entertainmentId) {
            await prisma.entertainment.delete({ where: { id: plan.entertainmentId } });
        }

        // Delete the celebration plan itself
        await prisma.celebrationPlan.delete({
            where: { id: planId },
        });

        res.status(200).json({ message: "Celebration plan and all associated data deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting celebration plan:", error);
        res.status(500).json({ message: `Error deleting celebration plan: ${error.message}` });
    }
};