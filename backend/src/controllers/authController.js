import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendNotification } from "../utils/notify.js";

const generateToken = (user) => {
  console.log('DEBUG: Generating token for user:', user._id, 'role:', user.role);
  console.log('DEBUG: JWT_SECRET available:', !!process.env.JWT_SECRET);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "5h" } // 5 hours - reasonable workday session
  );

  console.log('DEBUG: Token generated successfully, length:', token.length);
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Email validation based on role
    if (role !== 'it_support' && !email.endsWith('@organization.com')) {
      return res.status(400).json({ 
        message: "Employees must use their organization email address (@organization.com)"
      });
    }

    // Basic email format validation for IT staff
    if (role === 'it_support' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // If registering as IT support, create account but mark as not approved
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      isApproved: role === 'it_support' ? false : true
    });

    // If registering as IT support, notify admins and return pending response
    if (role === 'it_support') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        // notify admin (email or slack depending on env)
        await sendNotification(admin.email, 
          `New IT Support registration requires approval:\nName: ${name}\nEmail: ${email}\n` +
          `Approve at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`
        );
      }

      // Acknowledge applicant
      await sendNotification(email, 
        `Your IT Support registration is pending admin approval.\n` +
        `You will receive an email once an administrator approves your account.`
      );

      return res.status(201).json({
        message: "Registration pending admin approval",
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }
      });
    }

    // For non-IT staff, proceed as normal
    const token = generateToken(user);
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Admin: Approve IT staff registration
export const approveITStaff = async (req, res) => {
  try {
    const { userId } = req.params;
    const approver = req.user; // Admin who is approving

    // Find the IT staff user
    const itStaff = await User.findById(userId);
    if (!itStaff) {
      return res.status(404).json({ message: "User not found" });
    }

    if (itStaff.role !== 'it_support') {
      return res.status(400).json({ message: "User is not IT support staff" });
    }

    if (itStaff.isApproved) {
      return res.status(400).json({ message: "User is already approved" });
    }

    // Generate a temporary token for first login
    const tempToken = generateToken(itStaff);

    // Update user as approved
    itStaff.isApproved = true;
    itStaff.approvedAt = new Date();
    itStaff.approvedBy = approver._id;
    await itStaff.save();

    // Send approval notification
    await sendNotification({
      to: itStaff.email,
      template: 'approval',
      data: {
        name: itStaff.name,
        token: tempToken,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      }
    });

    res.status(200).json({ 
      message: "IT staff approved successfully",
      user: { 
        id: itStaff._id, 
        name: itStaff.name, 
        email: itStaff.email, 
        role: itStaff.role,
        isApproved: true 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error approving IT staff", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // If user is IT support but not yet approved, block login
    if (user.role === 'it_support' && user.isApproved === false) {
      return res.status(403).json({ message: 'Account pending administrator approval' });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email role');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // For JWT tokens, logout is mainly handled on the client side
    // But we can log the logout event and update user status
    const userId = req.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        currentStatus: 'offline',
        lastActive: new Date()
      });
    }

    console.log('DEBUG: User logged out:', userId);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Error during logout", error: error.message });
  }
};
