import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Fetch All Users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error : any) {
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
        const {
        name,
        email,
        cognitoId,
        membershipId,
        calendarId,
        createdAt,
        updatedAt
        } = req.body;
        const newUser = await prisma.user.create({
        data: {
            name,
            email,
            cognitoId,
            membershipId,
            calendarId,
            createdAt,
            updatedAt
        },
        });
        res.json({ message: "User Created Successfully", newUser });
    } catch (error: any) {
        res
        .status(500)
        .json({ message: `Error retrieving users: ${error.message}` });
    }
};
