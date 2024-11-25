import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get audit logs for a user
export const getAuditLogsByUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
        const logs = await prisma.auditLog.findMany({
            where: { userId: Number(userId) },
        });
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching audit logs: ${error.message}` });
    }
};

// Create an audit log
export const createAuditLog = async (req: Request, res: Response): Promise<void> => {
    const { actionType, entityType, userId, details } = req.body;
    try {
        const log = await prisma.auditLog.create({
            data: { actionType, entityType, userId, details },
        });
        res.status(201).json({ message: "Audit log created successfully", log });
    } catch (error: any) {
        res.status(500).json({ message: `Error creating audit log: ${error.message}` });
    }
};