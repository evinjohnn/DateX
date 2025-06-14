import express from "express";
import { getUserFromToken } from "../controllers/userController.js";
import { getMatches, getUserProfiles, swipeLeft, swipeRight } from "../controllers/matchController.js";

const router = express.Router();

router.post("/swipe-right/:likedUserId", getUserFromToken, swipeRight);
router.post("/swipe-left/:dislikedUserId", getUserFromToken, swipeLeft);
router.get("/", getUserFromToken, getMatches);
router.get("/user-profiles", getUserFromToken, getUserProfiles);

export default router;