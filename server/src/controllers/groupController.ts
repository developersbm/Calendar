import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch All Groups
export const getGroups = async (
  req: Request,
  res: Response
) : Promise<void> => {
  try {
      const groups = await prisma.group.findMany({
          include: {
              members: true,
              calendar: true,
          },
      });
      res.json(groups)
  } catch (error : any) {
      res
          .status(500)
          .json({ message: `Error retrieving groups: ${error.message}` });
  }
};

// Fetch Specific Group By ID
export const getGroup = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const group = await prisma.group.findUnique({
        where: { id: Number(id) },
        include: {
          members: true,
          calendar: true,
        },
      });
      if (!group) 
            res.status(404).json({ message: 'Group not found.' });
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ message: `Error retrieving group: ${error.message}` });
    }
};

// Create a new group
export const postGroup = async (req: Request, res: Response): Promise<void> => {
  let { title, description, iconUrl, userId } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ message: "Group title is required." });
    return;
  }

  try {
    userId = Number(userId);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid userId. Must be a number." });
      return;
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Set default icon URL if not provided
    if (!iconUrl) {
      iconUrl = "NULL";
    }

    // Create the group **and the calendar in the same transaction**
    const newGroup = await prisma.group.create({
      data: {
        title,
        description,
        iconUrl,
        calendar: {
          create: {
            ownerId: 0, // Temporary value; will be updated immediately after
            ownerType: "Group",
            description: `Calendar for ${title}`,
          },
        },
      },
      include: {
        calendar: true, // Fetch the created calendar
      },
    });

    // Update the calendar with the correct group ownerId
    const updatedCalendar = await prisma.calendar.update({
      where: { id: newGroup.calendar.id },
      data: { ownerId: newGroup.id }, // Set the actual group ID
    });

    // Step 3: Add the user as a group admin
    await prisma.groupMember.create({
      data: {
        groupId: newGroup.id,
        userId: user.id,
        role: "Admin",
        status: "Active",
      },
    });

    // Return updated group with linked calendar
    res.status(201).json({ 
      message: "Group created successfully", 
      group: { ...newGroup, calendar: updatedCalendar } 
    });
  } catch (error: any) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: `Error creating group: ${error.message}` });
  }
};

// Delete Group
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({ where: { id: Number(groupId) } });
    if (!group) {
      res.status(404).json({ message: "Group not found." });
      return;
    }

    await prisma.groupMember.deleteMany({ where: { groupId: Number(groupId) } });
    await prisma.group.delete({ where: { id: Number(groupId) } });

    res.json({ message: "Group deleted successfully." });
  } catch (error : any) {
    res.status(500).json({ message: `Error deleting group: ${error.message}` });
  }
};