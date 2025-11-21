import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log('DEBUG: Token present:', !!token);
    if (!token) return res.status(401).json({ message: "No token provided" });

    console.log('DEBUG: Verifying token, JWT_SECRET available:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('DEBUG: Token decoded successfully:', decoded.id, decoded.role);

    req.user = await User.findById(decoded.id).select("-password");
    console.log('DEBUG: User found:', !!req.user);

    // Update lastActive timestamp and attendance tracking
    if (req.user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update lastActive and conditionally update attendance if it exists
      const updateData = {
        lastActive: new Date()
      };

      // Only update attendance if the user has attendance tracking enabled
      // This prevents errors for users without attendance arrays
      try {
        await User.findByIdAndUpdate(req.user._id, updateData);
      } catch (error) {
        console.error('Error updating user activity:', error.message);
        // Still update lastActive even if attendance update fails
        await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
      }
    }

    next();
  } catch (error) {
    console.error('DEBUG: JWT verification failed:', error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
