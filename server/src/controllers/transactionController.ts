import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all transactions for a specific user
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { ownerId: Number(userId) },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: `Error fetching transactions: ${error.message}` });
  }
};

// Add a new transaction (Deposit or Withdraw)
export const addTransaction = async (req: Request, res: Response): Promise<void> => {
  const { userId, type, amount } = req.body;

  if (!userId || !type || !amount || !["Deposit", "Withdraw"].includes(type)) {
    res.status(400).json({ message: "Invalid request data." });
    return;
  }

  try {
    const newTransaction = await prisma.transaction.create({
      data: {
        ownerId: Number(userId),
        type,
        amount: parseFloat(amount),
      },
    });

    res.status(201).json(newTransaction);
  } catch (error: any) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: `Error adding transaction: ${error.message}` });
  }
};
