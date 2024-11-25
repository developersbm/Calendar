import { Router } from "express";
import { getUser, getUsers, postUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/", getUser);
router.get("/", postUser);

export default router;