import { Router } from "express";
import { getUser, getUsers, postUser, delUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:cognitoId", getUser);
router.post("/", postUser);
router.delete("/:cognitoId", delUser);

export default router;