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

  if (!title.trim()) {
    res.status(400).json({ message: "Group title is required." });
    return;
  }

  try {
    userId = Number(userId); // Convert userId to a number
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

    // Step 1: Create a new calendar for the group
    const newCalendar = await prisma.calendar.create({
      data: {
        ownerId: user.id,
        ownerType: "Group",
        description: `Calendar for ${title}`,
      },
    });

    // Step 2: Create the group and link it to the new calendar
    const newGroup = await prisma.group.create({
      data: {
        title,
        description,
        iconUrl,
        calendarId: newCalendar.id,
      },
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

    res.status(201).json({ message: "Group created successfully", newGroup });
  } catch (error: any) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: `Error creating group: ${error.message}` });
  }
};