import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";

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
    const { name, email, cognitoId, profilePicture } = req.body;

    // ✅ Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("⚠️ User already exists in database. Skipping creation.");
       res.status(200).json(existingUser); // ✅ Return existing user instead of failing
    }

    console.log("Creating new membership...");
    const newMembership = await prisma.membership.create({
      data: { type: "Free" },
    });

    console.log("Creating new user...");
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        cognitoId,
        membershipId: newMembership.id,
        profilePicture: profilePicture || null,
        calendarId: null, // Will be updated after calendar creation
      },
    });

    console.log("Creating calendar...");
    const newCalendar = await prisma.calendar.create({
      data: {
        ownerId: newUser.id,
        ownerType: "User",
        description: `${name}'s personal calendar`,
      },
    });

    console.log("Updating user with calendar ID...");
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: { calendarId: newCalendar.id },
    });

    console.log(" User successfully created and updated.");
   res.status(201).json(updatedUser);
  } catch (error: any) {
    console.error(" Error creating user:", error);
   res.status(500).json({ message: `Error creating user: ${error.message}` });
  }
};

// Delete User
const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const userPoolId = process.env.COGNITO_USER_POOL_ID;

export const delUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;

  if (!userPoolId) {
    res.status(500).json({ message: "Cognito User Pool ID is not configured." });
    return;
  }

  try {
    // Delete from Cognito
    const command = new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: cognitoId,
    });

    await cognitoClient.send(command);
    console.log("User deleted from Cognito");

    // Delete from Database
    const deletedUser = await prisma.user.delete({
      where: { cognitoId },
    });

    res.status(200).json({
      message: "User deleted successfully from Cognito and database",
      user: deletedUser,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: `Error deleting user: ${error.message}` });
  }
};