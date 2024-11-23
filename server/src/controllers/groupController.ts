import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();

export const getGroups = async (
    req: Request,
    res: Response
) : Promise<void> => {
    try {
        const groups = await prisma.group.findMany();
        res.json(prisma)
    } catch (error : any) {
        res
            .status(500)
            .json({ message: `Error retrieving groups: ${error.message}` });
    }
};