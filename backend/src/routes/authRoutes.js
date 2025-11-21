import express from "express";
import { registerUser, loginUser, approveITStaff, getUserProfile, changePassword, logoutUser } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/profile/:userId", protect, getUserProfile);
router.post("/change-password", protect, changePassword);
router.post("/approve-it-staff/:userId", protect, authorizeRoles('admin'), approveITStaff);

export default router;
