import express from "express";
import { addTransaction, getTransactions, clearTransactions} from '../controllers/transactionController';

const router = express.Router();

router.get("/:userId", getTransactions);
router.post("/", addTransaction);
router.delete("/:userId", clearTransactions);

export default router;