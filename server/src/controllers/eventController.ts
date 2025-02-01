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

// Fetch events for a calendar
export const getEventCalendar = async (req: Request, res: Response): Promise<void> => {
  const { calendarId } = req.query;

  if (!calendarId) {
    res.status(400).json({ message: "Calendar ID is required." });
    return;
  }

  try {
    console.log(`Fetching events for calendarId: ${calendarId}`);

    const events = await prisma.event.findMany({
      where: { calendarId: Number(calendarId) },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        calendarId: true,
      },
    });

    console.log("Events found:", events);
    
    res.status(200).json(events);
  } catch (error: any) {
    console.error("Error retrieving events:", error);
    res.status(500).json({ message: `Error retrieving events: ${error.message}` });
  }
};

// Create an event
export const postEvent = async (req: Request, res: Response): Promise<void> => {
  const { title, description, startTime, endTime, calendarId } = req.body;

  if (!calendarId) {
    res.status(400).json({ message: "Calendar ID is required." });
    return;
  }

  try {
    console.log("Received event data:", req.body);

    const calendar = await prisma.calendar.findUnique({
      where: { id: Number(calendarId) },
    });

    if (!calendar) {
      res.status(400).json({ message: "Invalid calendar ID." });
      return;
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        calendarId,
      },
    });

    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error: any) {
    console.error("Database error:", error);
    res.status(500).json({ message: `Error creating event: ${error.message}` });
  }
};

// Delete Event
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "Event ID is required." });
    return;
  }

  try {
    console.log(`Deleting event with ID: ${id}`);

    const eventExists = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!eventExists) {
      res.status(404).json({ message: "Event not found." });
      return;
    }

    const deletedEvent = await prisma.event.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Event deleted successfully", deletedEvent });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: `Error deleting event: ${error.message}` });
  }
};