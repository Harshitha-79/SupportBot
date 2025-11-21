import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

const router = Router();

// Get IT staff member's own stats
router.get('/stats', protect, authorizeRoles('it_support', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current ticket counts
    const [totalTickets, openTickets, resolvedTickets] = await Promise.all([
      Ticket.countDocuments({ assignedTo: user._id }),
      Ticket.countDocuments({ assignedTo: user._id, status: 'open' }),
      Ticket.countDocuments({ assignedTo: user._id, status: 'resolved' })
    ]);

    // Calculate resolution rate
    const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Get average resolution time
    const resolvedTicketsList = await Ticket.find({ 
      assignedTo: user._id, 
      status: 'resolved',
      resolvedAt: { $exists: true },
      assignedAt: { $exists: true }
    });

    let totalResolutionTime = 0;
    resolvedTicketsList.forEach(ticket => {
      const resolutionTime = ticket.resolvedAt - ticket.assignedAt;
      totalResolutionTime += resolutionTime;
    });

    const avgResolutionTime = resolvedTicketsList.length > 0 ? 
      Math.round(totalResolutionTime / resolvedTicketsList.length / (1000 * 60)) : 0; // Convert to minutes

    res.json({
      totalTickets,
      openTickets,
      resolvedTickets,
      resolutionRate,
      avgResolutionTime,
      workingHours: user.workingHours,
      currentStatus: user.currentStatus,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error('Error fetching IT staff stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get IT staff member's attendance records
router.get('/attendance', protect, authorizeRoles('it_support', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendance = user.attendance || [];
    const recentAttendance = attendance
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(recentAttendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// Update IT staff member's current status
router.post('/status', protect, authorizeRoles('it_support'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.currentStatus = status;
    user.lastActive = new Date();
    
    // If going online and no attendance record for today, create one
    if (status === 'online') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRecord = user.attendance?.find(record => 
        new Date(record.date).toDateString() === today.toDateString()
      );

      if (!todayRecord) {
        user.attendance = user.attendance || [];
        user.attendance.push({
          date: today,
          loginTime: new Date(),
          ticketsResolved: 0
        });
      }
    }
    // If going offline and have today's record, update it
    else if (status === 'offline') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRecord = user.attendance?.find(record => 
        new Date(record.date).toDateString() === today.toDateString()
      );

      if (todayRecord) {
        todayRecord.logoutTime = new Date();
        todayRecord.workDuration = Math.round(
          (todayRecord.logoutTime - todayRecord.loginTime) / (1000 * 60)
        );
      }
    }

    await user.save();
    res.json({ message: 'Status updated', currentStatus: status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Get all IT staff stats (for admin)
router.get('/all-stats', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const itStaff = await User.find({ role: 'it_support' }).select('name email stats workingHours currentStatus lastActive attendance');

    const stats = await Promise.all(itStaff.map(async (staff) => {
      // Calculate current stats from tickets
      const [totalTickets, openTickets, resolvedTickets] = await Promise.all([
        Ticket.countDocuments({ assignedTo: staff._id }),
        Ticket.countDocuments({ assignedTo: staff._id, status: 'open' }),
        Ticket.countDocuments({ assignedTo: staff._id, status: 'resolved' })
      ]);

      const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

      const resolvedTicketsList = await Ticket.find({
        assignedTo: staff._id,
        status: 'resolved',
        resolvedAt: { $exists: true },
        assignedAt: { $exists: true }
      });

      let totalResolutionTime = 0;
      resolvedTicketsList.forEach(ticket => {
        const resolutionTime = ticket.resolvedAt - ticket.assignedAt;
        totalResolutionTime += resolutionTime;
      });

      const avgResolutionTime = resolvedTicketsList.length > 0 ?
        Math.round(totalResolutionTime / resolvedTicketsList.length / (1000 * 60)) : 0;

      // Get recent attendance
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAttendance = staff.attendance?.filter(record => new Date(record.date) >= thirtyDaysAgo) || [];

      return {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        totalTickets,
        openTickets,
        resolvedTickets,
        resolutionRate,
        avgResolutionTime,
        workingHours: staff.workingHours,
        currentStatus: staff.currentStatus,
        lastActive: staff.lastActive,
        recentAttendance
      };
    }));

    res.json(stats);
  } catch (error) {
    console.error('Error fetching all IT staff stats:', error);
    res.status(500).json({ message: 'Failed to fetch IT staff stats' });
  }
});

export default router;