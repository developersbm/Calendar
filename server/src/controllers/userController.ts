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

    if (!name || !email || !cognitoId) {
      return res.status(400).json({ message: "Missing required fields: name, email, or cognitoId" });
    }

    console.log("Creating new membership...");
    // Create a new Membership
    const newMembership = await prisma.membership.create({
      data: {
        type: "Free", // Default membership type
      },
    });

    console.log("Membership created with ID:", newMembership.id);

    console.log("Creating new user...");
    // Create the User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        cognitoId,
        membershipId: newMembership.id,
        profilePicture: profilePicture || null, // Ensure profile picture is handled
        calendarId: null, // This will be updated later
      },
    });

    console.log("User created with ID:", newUser.id);

    console.log("Creating new calendar for user...");
    // Create a new Calendar for the user
    const newCalendar = await prisma.calendar.create({
      data: {
        ownerId: newUser.id,
        ownerType: "User",
        description: `${name}'s personal calendar`,
      },
    });

    console.log("Calendar created with ID:", newCalendar.id);

    console.log("Updating user with calendar ID...");
    // Update the User with the calendarId
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        calendarId: newCalendar.id,
      },
    });

    console.log("User updated successfully!");

    res.status(201).json(updatedUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: `Error creating user: ${error.message}`,
    });
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