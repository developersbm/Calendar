import express from "express";
import { addTransaction, getTransactions } from '../controllers/transactionController';

const router = express.Router();

router.get("/:userId", getTransactions);
router.post("/", addTransaction);

export default router;