import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all Memberships
export const getMemberships = async (req: Request, res: Response): Promise<void> => {
    try {
        const memberships = await prisma.membership.findMany();
        res.json(memberships);
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving memberships: ${error.message}` });
    }
};

// Create Memberships
export const createMembership = async (req: Request, res: Response): Promise<void> => {
    const { type } = req.body;
    try {
        const membership = await prisma.membership.create({ data: { type } });
        res.json({ message: "Membership created successfully", membership });
    } catch (error: any) {
        res.status(500).json({ message: `Error creating membership: ${error.message}` });
    }
};