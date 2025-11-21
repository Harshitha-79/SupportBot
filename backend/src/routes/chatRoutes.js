import express from "express";
import { askBot } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chat endpoint requires authentication
router.post("/ask", protect, askBot);

export default router;
