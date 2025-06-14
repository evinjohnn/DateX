import express from "express";
import { getUserFromToken } from "../controllers/userController.js";
import { getConversation, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.use(getUserFromToken);

router.post("/send", sendMessage);
router.get("/conversation/:userId", getConversation);

export default router;