import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch All Calendars
export const getCalendars = async (req: Request, res: Response): Promise<void> => {
    try {
      const calendars = await prisma.calendar.findMany({
        include: {
          events: true,
          User: true,
          Group: true,
        },
      });
      res.json(calendars);
    } catch (error: any) {
      res.status(500).json({ message: `Error retrieving calendars: ${error.message}` });
    }
};

// Fetch Calendars By Id
export const getCalendar = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const calendar = await prisma.calendar.findUnique({
        where: { id: Number(id) },
        include: {
          events: true,
          User: true,
          Group: true,
        },
      });
      if (!calendar) 
        res.status(404).json({ message: 'Calendar not found.' });
      res.json(calendar);
    } catch (error: any) {
      res.status(500).json({ message: `Error retrieving calendar: ${error.message}` });
    }
};

// Create a new calendar
export const postCalendar = async (req: Request, res: Response): Promise<void> => {
    const { ownerId, ownerType, description } = req.body;
    try {
      const newCalendar = await prisma.calendar.create({
        data: {
          ownerId,
          ownerType,
          description,
        },
      });
      res.json({ message: 'Calendar created successfully', newCalendar });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating calendar: ${error.message}` });
    }
};  