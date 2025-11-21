import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import AdminMessage from "../models/AdminMessage.js";
import bcrypt from 'bcryptjs';
import { computeExpectedResolution } from "../utils/slaUtils.js";
import { sendNotification } from "../utils/notify.js";
import jwt from 'jsonwebtoken';

// Helper function to find the least loaded IT staff
const findLeastLoadedIT = async () => {
  const itUsers = await User.find({ role: "it_support", isActive: true, isApproved: true }).select("_id name email");
  if (itUsers.length === 0) return null;

  let best = null;
  for (const user of itUsers) {
    const openTickets = await Ticket.countDocuments({ assignedTo: user._id, status: { $in: ["open", "in_progress"] } });
    if (!best || openTickets < best.count) {
      best = { userId: user._id, user, count: openTickets };
    }
  }
  return best;
};

// List unassigned resolved tickets
export const listUnassignedResolved = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      assignedTo: { $in: [null, undefined] },
      resolvedByUser: true,
      $or: [
        { resolvedByIT: { $in: [false, null] } },
        { resolvedByITId: { $in: [null, undefined] } }
      ]
    }).populate('createdBy', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all tickets for admin
export const listAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List pending IT user approvals
export const listPendingItUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'it_support', isApproved: false }).select('name email createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve an IT user
export const approveItUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    let isReactivation = false;
    if (user.role === 'it_support' && !user.isActive) {
      // Reactivation of deactivated IT user
      user.isActive = true;
      isReactivation = true;
    } else if (user.role === 'it_support') {
      // Pending approval for new IT user
      if (user.isApproved) {
        return res.status(400).json({ message: 'User already approved' });
      }
    } else if (user.role === 'employee' && !user.isActive) {
      // Reactivation of removed IT user
      user.role = 'it_support';
      user.isActive = true;
      isReactivation = true;
    } else {
      return res.status(400).json({ message: 'Invalid user' });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const message = isReactivation
      ? `Your IT support account has been reactivated by admin ${req.user.name}. You can now log in.\nToken (valid 7 days): ${token}\nLogin at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      : `Your account has been approved by admin ${req.user.name}. You can now log in.\nToken (valid 7 days): ${token}\nLogin at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    try {
      await sendNotification(user.email, message);
    } catch (notifyErr) {
      console.log('Approval notification failed:', notifyErr.message);
    }

    res.json({ message: isReactivation ? 'User reactivated' : 'User approved', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all IT staff with stats
export const listItUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'it_support' }).select('name email workingHours createdAt isActive isApproved lastActive');

    const now = new Date();
    const onlineThreshold = 30 * 60 * 1000; // 30 minutes

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const [openTickets, resolvedTickets, totalTickets] = await Promise.all([
        Ticket.countDocuments({ assignedTo: user._id, status: { $in: ['open', 'in_progress'] } }),
        Ticket.countDocuments({ assignedTo: user._id, status: 'resolved' }),
        Ticket.countDocuments({ assignedTo: user._id })
      ]);

      let avgResolutionTime = 0;
      if (resolvedTickets > 0) {
        const resolvedTicketsList = await Ticket.find({
          assignedTo: user._id,
          status: 'resolved',
          resolvedAt: { $exists: true },
          assignedAt: { $exists: true }
        }).select('resolvedAt assignedAt');

        const totalTime = resolvedTicketsList.reduce((sum, ticket) => sum + (new Date(ticket.resolvedAt) - new Date(ticket.assignedAt)), 0);
        avgResolutionTime = totalTime / resolvedTicketsList.length;
      }

      const isOnline = user.lastActive && (now - new Date(user.lastActive)) < onlineThreshold;
      const resolutionRate = totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
      const avgTime = Math.round(avgResolutionTime / (1000 * 60)); // minutes

      let efficiencyStatement = '';
      if (totalTickets === 0) {
        efficiencyStatement = 'No tickets yet';
      } else if (resolutionRate >= 80 && avgTime <= 60) {
        efficiencyStatement = 'High efficiency';
      } else if (resolutionRate >= 60 && avgTime <= 120) {
        efficiencyStatement = 'Good efficiency';
      } else if (resolutionRate >= 40) {
        efficiencyStatement = 'Moderate efficiency';
      } else {
        efficiencyStatement = 'Needs improvement';
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        workingHours: user.workingHours,
        createdAt: user.createdAt,
        isActive: user.isActive !== false,
        isApproved: user.isApproved !== false,
        isOnline,
        lastActive: user.lastActive,
        stats: {
          openTickets,
          resolvedTickets,
          totalTickets,
          avgResolutionTime: avgTime,
          resolutionRate,
          efficiencyStatement
        }
      };
    }));

    usersWithStats.sort((a, b) => {
      if (a.isActive !== b.isActive) return b.isActive - a.isActive;
      return a.name.localeCompare(b.name);
    });

    res.json({
      total: usersWithStats.length,
      active: usersWithStats.filter(u => u.isActive).length,
      users: usersWithStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve IT staff list', error: err.message });
  }
};

// Remove (deactivate) an IT user
export const removeItUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'it_support') {
      return res.status(404).json({ message: 'IT staff not found' });
    }

    // Reassign open tickets
    const openTickets = await Ticket.find({ assignedTo: user._id, status: { $in: ['open', 'in_progress'] } });
    if (openTickets.length > 0) {
      const otherIT = await User.find({ _id: { $ne: user._id }, role: 'it_support', isActive: true, isApproved: true });
      if (otherIT.length === 0) {
        return res.status(400).json({ message: 'Cannot remove last active IT staff with open tickets' });
      }

      for (let i = 0; i < openTickets.length; i++) {
        const ticket = openTickets[i];
        const assignTo = otherIT[i % otherIT.length];
        ticket.assignedTo = assignTo._id;
        ticket.statusHistory = ticket.statusHistory || [];
        ticket.statusHistory.push({
          status: ticket.status,
          changedBy: req.user._id,
          note: `Reassigned due to IT staff removal`
        });
        await ticket.save();

        try {
          await sendNotification(assignTo.email, `Ticket #${ticket._id} reassigned to you.`);
        } catch (notifyErr) {
          console.log('Reassignment notification failed:', notifyErr.message);
        }
      }
    }

    user.isActive = false;
    user.isApproved = false;
    user.role = 'employee';
    user.currentStatus = 'offline';
    await user.save();

    try {
      await sendNotification(user.email, `Your IT support access removed by admin ${req.user.name}.`);
    } catch (notifyErr) {
      console.log('Removal notification failed:', notifyErr.message);
    }

    res.json({ message: 'User removed from IT staff', user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto-assign all unassigned tickets
export const applyAssignAll = async (req, res) => {
  try {
    const best = await findLeastLoadedIT();
    if (!best) return res.status(400).json({ message: 'No active IT staff available' });

    const tickets = await Ticket.find({ assignedTo: { $in: [null, undefined] }, resolvedByUser: true });
    const results = [];
    for (const ticket of tickets) {
      ticket.assignedTo = best.userId;
      ticket.assignedAt = new Date();
      ticket.expectedResolutionAt = computeExpectedResolution(ticket.assignedAt, 4);
      ticket.resolvedByIT = false;
      ticket.resolvedByITId = null;
      ticket.resolvedByITAt = null;
      if (ticket.status === 'resolved') ticket.status = 'in_progress';
      await ticket.save();
      results.push(ticket);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new IT user
export const createItUser = async (req, res) => {
  try {
    const { name, email, password, workingHours } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const wh = workingHours || { start: '09:00', end: '17:00', breaks: [] };

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'it_support',
      workingHours: wh,
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: req.user?._id
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    try {
      await sendNotification(user.email, `Added as IT support by ${req.user?.name || 'admin'}.\nLogin at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login\nToken: ${token}`);
    } catch (notifyErr) {
      console.log('Creation notification failed:', notifyErr.message);
    }

    res.status(201).json({
      message: 'IT user created',
      user: { id: user._id, name: user.name, email: user.email, workingHours: user.workingHours }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update working hours for an IT user
export const updateWorkingHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { workingHours } = req.body;
    if (!workingHours) {
      return res.status(400).json({ message: 'Working hours required' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'it_support') {
      return res.status(404).json({ message: 'IT user not found' });
    }

    user.workingHours = workingHours;
    await user.save();

    res.json({
      message: 'Working hours updated',
      user: { id: user._id, name: user.name, email: user.email, workingHours: user.workingHours }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send message to IT staff
export const sendMessageToIT = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'Recipient, subject, and message are required' });
    }

    const recipient = await User.findById(to);
    if (!recipient || recipient.role !== 'it_support') {
      return res.status(404).json({ message: 'IT staff member not found' });
    }

    const adminMessage = await AdminMessage.create({
      from: req.user._id,
      to,
      subject,
      message
    });

    // Send notification
    try {
      await sendNotification(recipient.email, `New message from Admin: ${subject}\n\n${message}`);
    } catch (notifyErr) {
      console.warn('Message notification failed:', notifyErr.message);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: adminMessage
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages for admin (sent messages)
export const getAdminMessages = async (req, res) => {
  try {
    const messages = await AdminMessage.find({ from: req.user._id })
      .populate('to', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages for IT staff (received messages)
export const getITMessages = async (req, res) => {
  try {
    const messages = await AdminMessage.find({ to: req.user._id })
      .populate('from', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark message as read
export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await AdminMessage.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only recipient can mark as read
    if (message.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance report
export const getAttendanceReport = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    let query = { role: 'it_support' };
    if (userId) {
      query._id = userId;
    }

    const users = await User.find(query).select('name email attendance');

    const report = users.map(user => {
      const monthlyAttendance = user.attendance.filter(att => {
        const attDate = new Date(att.date);
        const attMonth = attDate.getMonth() + 1;
        const attYear = attDate.getFullYear();

        return (!month || attMonth === parseInt(month)) &&
               (!year || attYear === parseInt(year));
      });

      const totalHours = monthlyAttendance.reduce((sum, att) => sum + (att.workDuration || 0), 0) / 60; // Convert to hours
      const totalDays = monthlyAttendance.length;

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        totalHours: Math.round(totalHours * 100) / 100,
        totalDays,
        avgHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0,
        attendance: monthlyAttendance
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
