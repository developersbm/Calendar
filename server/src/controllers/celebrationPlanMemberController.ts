import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all celebration plan members
export const getAllCelebrationPlanMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const members = await prisma.celebrationPlanMember.findMany();
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: `Error fetching all celebration plan members: ${error.message}` });
    }
};

// Fetch all members of a specific celebration plan
export const getMembersByCelebrationPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;

        if (!planId) {
            res.status(400).json({ error: "Celebration Plan ID is required" });
            return;
        }

        // Fetch members of the celebration plan along with their user details
        const planMembers = await prisma.celebrationPlanMember.findMany({
            where: { planId: Number(planId) },
            include: {
                user: {
                    include: {
                        calendar: {
                            include: {
                                events: {
                                    include: {
                                        participants: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Extract user information along with their events
        const membersWithEvents = planMembers.map((member) => ({
            userId: member.user.id,
            name: member.user.name,
            email: member.user.email,
            role: member.role,
            status: member.status,
            events: member.user.calendar?.events || [],
        }));

        res.status(200).json(membersWithEvents);
    } catch (error) {
        console.error("Error fetching celebration plan members:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Add a member to a celebration plan
export const addCelebrationPlanMember = async (req: Request, res: Response): Promise<void> => {
  const { planId, email, role } = req.body;

  if (!planId || !email || !role) {
      res.status(400).json({ message: "Celebration Plan ID, email, and role are required." });
      return;
  }

  try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
          res.status(404).json({ message: "User not found." });
          return;
      }

      // Check if the user is already a member
      const existingMember = await prisma.celebrationPlanMember.findUnique({
          where: { planId_userId: { planId: Number(planId), userId: user.id } },
      });

      if (existingMember) {
          res.status(400).json({ message: "User is already a member of this plan." });
          return;
      }

      // Add the user to the celebration plan
      await prisma.celebrationPlanMember.create({
          data: {
              planId: Number(planId),
              userId: user.id,
              role,
              status: "Accepted",
          },
      });

      res.status(200).json({ message: "Member added successfully!" });
  } catch (error: any) {
      console.error("Error adding member:", error);
      res.status(500).json({ message: `Error adding member: ${error.message}` });
  }
};


// Update a celebration plan member's role or status
export const updateCelebrationPlanMember = async (req: Request, res: Response): Promise<void> => {
    const { planId, userId } = req.params;
    const { role, status } = req.body;

    try {
        const member = await prisma.celebrationPlanMember.update({
            where: { planId_userId: { planId: Number(planId), userId: Number(userId) } },
            data: { role, status },
        });
        res.json({ message: "Member updated successfully", member });
    } catch (error: any) {
        res.status(500).json({ message: `Error updating member: ${error.message}` });
    }
};

// Remove a member from a celebration plan
export const removeCelebrationPlanMember = async (req: Request, res: Response): Promise<void> => {
    const { planId, userId } = req.params;
    try {
        const member = await prisma.celebrationPlanMember.findUnique({
            where: { planId_userId: { planId: Number(planId), userId: Number(userId) } },
        });
        if (!member) {
            res.status(404).json({ message: "Member not found in this celebration plan." });
            return;
        }

        await prisma.celebrationPlanMember.delete({
            where: { planId_userId: { planId: Number(planId), userId: Number(userId) } },
        });

        res.json({ message: "Member removed successfully." });
    } catch (error: any) {
        res.status(500).json({ message: `Error removing member: ${error.message}` });
    }
};
