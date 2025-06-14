import express from "express";
import { updateProfile, getUserFromToken } from "../controllers/userController.js";

const router = express.Router();

router.put("/update", getUserFromToken, updateProfile);

export default router;