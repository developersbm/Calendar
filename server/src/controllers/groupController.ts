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
export const postGroup = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { title, description, iconUrl, calendarId } = req.body;
    try {
      const newGroup = await prisma.group.create({
        data: {
          title,
          description,
          iconUrl,
          calendarId,
        },
      });
      res.json({ message: 'Group created successfully', newGroup });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating group: ${error.message}` });
    }
};