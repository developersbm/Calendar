import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get participants for an event
export const getParticipantsByEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    try {
        const participants = await prisma.eventParticipant.findMany({
            where: { eventId: Number(eventId) },
            include: { user: true },
        });
        res.json(participants);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching participants: ${error.message}` });
    }
};

// Add a participant to an event
export const addParticipantToEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventId, userId, status } = req.body;
    try {
        const participant = await prisma.eventParticipant.create({
            data: { eventId, userId, status },
        });
        res.status(201).json({ message: "Participant added successfully", participant });
    } catch (error: any) {
        res.status(500).json({ message: `Error adding participant: ${error.message}` });
    }
};

// Update a participant's status
export const updateParticipantStatus = async (req: Request, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;
    const { status } = req.body;
    try {
        const participant = await prisma.eventParticipant.update({
            where: { eventId_userId: { eventId: Number(eventId), userId: Number(userId) } },
            data: { status },
        });
        res.json({ message: "Participant status updated", participant });
    } catch (error: any) {
        res.status(500).json({ message: `Error updating participant status: ${error.message}` });
    }
};

// Remove a participant from an event
export const removeParticipantFromEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;
    try {
        await prisma.eventParticipant.delete({
            where: { eventId_userId: { eventId: Number(eventId), userId: Number(userId) } },
        });
        res.json({ message: "Participant removed successfully" });
    } catch (error: any) {
        res.status(500).json({ message: `Error removing participant: ${error.message}` });
    }
};