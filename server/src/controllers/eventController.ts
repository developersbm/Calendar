import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch All Events
export const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        include: {
          calendar: true,
          participants: true,
        },
      });
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: `Error retrieving events: ${error.message}` });
    }
};

// Fetch Events by ID
export const getEvent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const event = await prisma.event.findUnique({
        where: { id: Number(id) },
        include: {
          calendar: true,
          participants: true,
        },
      });
      if (!event) 
        res.status(404).json({ message: 'Event not found.' });
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: `Error retrieving event: ${error.message}` });
    }
};

// Create an event
export const postEvent = async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      description,
      startTime,
      endTime,
      recurrence,
      endRecurrence,
      calendarId,
    } = req.body;
    try {
      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          recurrence,
          endRecurrence: endRecurrence ? new Date(endRecurrence) : null,
          calendarId,
        },
      });
      res.json({ message: 'Event created successfully', newEvent });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating event: ${error.message}` });
    }
};  