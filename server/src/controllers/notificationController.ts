import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Leave notification as read
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    const { notificationId } = req.params;
    try {
        const notification = await prisma.notification.update({
            where: { id: Number(notificationId) },
            data: { status: 'Read' },
        });
        res.json({ message: "Notification marked as read", notification });
    } catch (error: any) {
        res.status(500).json({ message: `Error updating notification: ${error.message}` });
    }
};

// Create more...