import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Fetch All Users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error: any) {
        res
        .status(500)
        .json({ message: `Error retrieving users: ${error.message}` });
    }
};

// Get User by ID
export const getUser = async (req: Request, res: Response): Promise<void> => {
    const { cognitoId } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: {
          cognitoId: cognitoId,
        },
      });
      res.json(user);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error retrieving user: ${error.message}` });
    }
};

// Create User
export const postUser = async (req: Request, res: Response) => {
  try {
    const { name, email, cognitoId } = req.body;

    // Create a new Membership
    const newMembership = await prisma.membership.create({
      data: {
        type: "Free", // Default membership type
      },
    });

    // Create the User (without the calendarId for now)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        cognitoId,
        membershipId: newMembership.id,
      },
    });

    // Create a new Calendar for the user
    const newCalendar = await prisma.calendar.create({
      data: {
        ownerId: newUser.id,
        ownerType: "User",
        description: `${name}'s personal calendar`,
      },
    });

    // Update the User with the calendarId
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        calendarId: newCalendar.id,
      },
    });

    res.status(201).json(updatedUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};
