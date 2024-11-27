import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all group members
export const getAllMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const members = await prisma.groupMember.findMany();
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching all members: ${error.message}` });
    }
};

// Fetch all members of a group
export const getMembersByGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId } = req.params;
    try {
        const members = await prisma.groupMember.findMany({
            where: { groupId: Number(groupId) },
            include: { user: true },
        });
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching group members: ${error.message}` });
    }
};

// Add a member to a group
export const addMemberToGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId, userId, role, status } = req.body;
    try {
        const member = await prisma.groupMember.create({
            data: { groupId, userId, role, status },
        });
        res.status(201).json({ message: "Member added successfully", member });
    } catch (error: any) {
        res.status(500).json({ message: `Error adding member: ${error.message}` });
    }
};

// Update a member's role or status
export const updateMemberRoleOrStatus = async (req: Request, res: Response): Promise<void> => {
    const { groupId, userId } = req.params;
    const { role, status } = req.body;
    try {
        const member = await prisma.groupMember.update({
            where: { groupId_userId: { groupId: Number(groupId), userId: Number(userId) } },
            data: { role, status },
        });
        res.json({ message: "Member updated successfully", member });
    } catch (error: any) {
        res.status(500).json({ message: `Error updating member: ${error.message}` });
    }
};

// Remove a member from a group
export const removeMemberFromGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId, userId } = req.params;
    try {
        await prisma.groupMember.delete({
            where: { groupId_userId: { groupId: Number(groupId), userId: Number(userId) } },
        });
        res.json({ message: "Member removed successfully" });
    } catch (error: any) {
        res.status(500).json({ message: `Error removing member: ${error.message}` });
    }
};