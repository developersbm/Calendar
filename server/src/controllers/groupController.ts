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

    // 🔹 Check if the user already has a calendar
    let calendar = await prisma.calendar.findFirst({
      where: { ownerId: userId, ownerType: "Group" },
    });

    // 🔹 If no calendar exists, create a new one
    if (!calendar) {
      calendar = await prisma.calendar.create({
        data: {
          ownerId: userId,
          ownerType: "Group",
          description: `Calendar for ${title}`,
        },
      });
    }

    // Set default icon URL if not provided
    if (!iconUrl) {
      iconUrl = "NULL";
    }

    // Step 2: Create the group (link it to the existing or new calendar)
    const newGroup = await prisma.group.create({
      data: {
        title,
        description,
        iconUrl,
        calendarId: calendar.id, // 🔹 Link the group to the calendar
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

    res.status(201).json({
      message: "Group created successfully",
      group: { ...newGroup, calendar },
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
    const group = await prisma.group.findUnique({
      where: { id: Number(groupId) },
      include: { calendar: true },
    });

    if (!group) {
      res.status(404).json({ message: "Group not found." });
      return;
    }

    await prisma.$transaction(async (prisma) => {
      // Step 1: Delete all group members
      await prisma.groupMember.deleteMany({ where: { groupId: Number(groupId) } });

      // Step 2: Delete all event participants linked to this group's calendar
      if (group.calendarId) {
        await prisma.eventParticipant.deleteMany({
          where: { event: { calendarId: group.calendarId } },
        });

        // Step 3: Delete all events linked to this group's calendar
        await prisma.event.deleteMany({
          where: { calendarId: group.calendarId },
        });
      }

      // 🔹 Step 4: Delete the Group FIRST to remove the foreign key constraint
      await prisma.group.delete({ where: { id: Number(groupId) } });

      // 🔹 Step 5: Check if the calendar is still being used by another group
      const otherGroupsUsingCalendar = await prisma.group.findFirst({
        where: { calendarId: group.calendarId },
      });

      // 🔹 Step 6: If no other groups are using this calendar, delete it
      if (!otherGroupsUsingCalendar && group.calendarId) {
        await prisma.calendar.delete({
          where: { id: group.calendarId },
        });
      }
    });

    res.json({ message: "Group and associated calendar deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: `Error deleting group: ${error.message}` });
  }
};
