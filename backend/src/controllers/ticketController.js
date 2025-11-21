import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import KbDocument from "../models/KbDocument.js";
import { embedText, addVector, saveIndex, searchSimilar } from "../utils/faissUtils.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to auto-assign ticket to least loaded IT support
const assignToLeastLoadedIT = async () => {
  const itSupportUsers = await User.find({ role: "it_support" }).select("_id");
  if (itSupportUsers.length === 0) return undefined;
  
  const counts = await Promise.all(
    itSupportUsers.map(async (u) => ({
      userId: u._id,
      count: await Ticket.countDocuments({ assignedTo: u._id, status: { $in: ["open", "in_progress"] } })
    }))
  );
  counts.sort((a, b) => a.count - b.count);
  return counts[0]?.userId;
};

// Helper function to create a ticket (used by both API endpoint and chatbot)
import { sendNotification } from "../utils/notify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export { upload };

export const createTicketHelper = async (userId, title, description, chatHistory = [], priority = 'medium') => {
  const assignedToUserId = await assignToLeastLoadedIT();
  const slaHours = priority === 'high' ? 2 : priority === 'medium' ? 4 : 8;
  const expectedResolutionAt = null; // We'll set this later if needed, but for now just create the ticket

  const ticket = await Ticket.create({
    title,
    description,
    createdBy: userId,
    assignedTo: assignedToUserId,
    expectedResolutionAt,
    chatHistory,
    priority,
  });

  // Populate assignedTo for returning useful info (name/email)
  await ticket.populate({ path: 'assignedTo', select: 'name email' });

  // If ticket is assigned to IT staff, send notification
  if (assignedToUserId) {
    const [assignedStaff, requester] = await Promise.all([
      User.findById(assignedToUserId),
      User.findById(userId)
    ]);

    if (assignedStaff) {
      // Emit real-time notification to IT staff
      try {
        if (global.io) {
          global.io.to(`user_${assignedToUserId}`).emit('newTicketAssigned', {
            ticket: {
              _id: ticket._id,
              title: ticket.title,
              description: ticket.description,
              priority: ticket.priority,
              createdAt: ticket.createdAt,
              createdBy: { name: requester?.name || 'Unknown' }
            }
          });
          console.log('Emitted newTicketAssigned event to user:', assignedToUserId);
        }
      } catch (socketErr) {
        console.warn('Failed to emit new ticket notification:', socketErr.message);
      }
      // Send email/notification but do not let notification failures block ticket creation
      try {
        await sendNotification({
          to: assignedStaff.email,
          template: 'staff-message',
          data: {
            subject: 'New assigned ticket',
            ticketId: ticket._id,
            title,
            description,
            priority,
            requesterName: requester ? requester.name : 'Unknown',
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/it/tickets/${ticket._id}`,
            chatHistory
          }
        });
      } catch (notifyErr) {
        console.warn('Failed to notify assigned staff:', notifyErr?.message || notifyErr);
      }

      // Notify requester (confirmation) — failures logged but not thrown
      if (requester && requester.email) {
        try {
          await sendNotification({
            to: requester.email,
            template: 'simple',
            data: {
              message: `Your ticket has been created: ${title} (ID: ${ticket._id}). Assigned to: ${assignedStaff.name || 'IT Support'}. You will be notified when updates occur.`
            }
          });
        } catch (notifyErr) {
          console.warn('Failed to notify requester:', notifyErr?.message || notifyErr);
        }
      }

      // Notify all admins (informational)
      try {
        const admins = await User.find({ role: 'admin' }).select('email name');
        for (const a of admins) {
          if (a?.email) {
            try {
              await sendNotification({
                to: a.email,
                template: 'staff-message',
                data: {
                  subject: 'New support ticket created',
                  ticketId: ticket._id,
                  title,
                  requesterName: requester ? requester.name : 'Unknown',
                  assignedTo: assignedStaff.name || 'IT Support',
                  chatHistory
                }
              });
            } catch (notifyErr) {
              console.warn(`Failed to notify admin ${a.email}:`, notifyErr?.message || notifyErr);
            }
          }
        }
      } catch (adminsErr) {
        console.warn('Failed to enumerate admins for notification:', adminsErr?.message || adminsErr);
      }
    }
  }

  return ticket;
};

// Employee: create new ticket
export const createTicket = async (req, res) => {
  try {
    console.log('DEBUG: createTicket called with body:', req.body);
    const { title, description, chatHistory } = req.body;
    console.log('DEBUG: User ID:', req.user._id);
    // allow optional chatHistory to be passed from frontend (used by chatbot flows)
    const ticket = await createTicketHelper(req.user._id, title, description, Array.isArray(chatHistory) ? chatHistory : []);
    console.log('DEBUG: Ticket created successfully:', ticket._id);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('DEBUG: createTicket error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tickets for current user
export const getMyTickets = async (req, res) => {
  try {
    console.log('DEBUG: getMyTickets called for user:', req.user._id);
    const tickets = await Ticket.find({ createdBy: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('resolvedByITId', 'name email')
      .populate('resolvedByUserId', 'name email')
      .populate('createdBy', 'name email');
    console.log('DEBUG: Found tickets:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('DEBUG: getMyTickets error:', error);
    res.status(500).json({ message: error.message });
  }
};

// IT Support: get all assigned tickets
export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('resolvedByITId', 'name email')
      .populate('resolvedByUserId', 'name email')
      .populate('createdBy', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single ticket by id with access control
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const role = req.user.role;
    // employee can view only their tickets
    if (role === "employee" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    // it_support can view only assigned tickets
    if (role === "it_support" && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'resolvedByITId', select: 'name email' },
      { path: 'resolvedByUserId', select: 'name email' },
      { path: 'messages.from', select: 'name email' }
    ]);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// IT Staff: Request employee confirmation
export const requestEmployeeConfirmation = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const role = req.user.role;
    // Only IT support assigned to this ticket can request confirmation
    if (role !== 'it_support' || ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Add confirmation request to ticket
    if (!ticket.confirmationRequests) ticket.confirmationRequests = [];
    ticket.confirmationRequests.push({
      requestedBy: req.user._id,
      requestedAt: new Date(),
      status: 'pending'
    });

    await ticket.save();

    // Notify employee
    try {
      const employee = await User.findById(ticket.createdBy);
      if (employee?.email) {
        await sendNotification({
          to: employee.email,
          template: 'simple',
          data: {
            message: `IT Support has requested your confirmation for ticket ${ticket._id}: "${ticket.title}". Please review and confirm if the issue is resolved.`
          }
        });
      }
    } catch (notifyErr) {
      console.warn('Failed to notify employee:', notifyErr?.message || notifyErr);
    }

    res.json({ message: "Confirmation request sent to employee" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a message to an existing ticket (used for ongoing chat between user and IT)
export const addMessage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { text } = req.body;

    // Allow messages with just attachments or just text
    if ((!text || !text.trim()) && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Message text or attachments are required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const role = req.user.role;
    // employee can post only to their tickets
    if (role === 'employee' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // it_support can post only to assigned tickets
    if (role === 'it_support' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`
        });
      }
    }

    // append message
    ticket.messages.push({
      from: req.user._id,
      text: text ? text.trim() : '',
      attachments,
      at: new Date()
    });

    // if IT replies, set status to in_progress
    if (role === 'it_support' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    // populate the last message's sender
    await ticket.populate({ path: 'messages.from', select: 'name email' });

    const lastMsg = ticket.messages[ticket.messages.length - 1];

    // Emit socket event for real-time updates
    try {
      if (global.io) {
        global.io.to(`ticket_${ticketId}`).emit('newMessage', { message: lastMsg, ticketId });
        console.log('Emitted newMessage event for ticket:', ticketId);
      }
    } catch (socketErr) {
      console.warn('Failed to emit socket event:', socketErr.message);
    }

    // notify the other party (best-effort)
    try {
      const messagePreview = text ? text : `Attachment: ${attachments.length} file(s)`;
      if (role === 'it_support' && ticket.createdBy) {
        const user = await User.findById(ticket.createdBy);
        if (user?.email) {
          await sendNotification({ to: user.email, template: 'simple', data: { message: `IT replied on your ticket ${ticket._id}: ${messagePreview}` } });
        }
      }
      if (role === 'employee' && ticket.assignedTo) {
        const itUser = await User.findById(ticket.assignedTo);
        if (itUser?.email) {
          await sendNotification({ to: itUser.email, template: 'simple', data: { message: `New message on ticket ${ticket._id} from requester: ${messagePreview}` } });
        }
      }
    } catch (notifyErr) {
      console.warn('Failed to send message notification:', notifyErr?.message || notifyErr);
    }

    res.json({ message: lastMsg });
  } catch (err) {
    console.error('addMessage error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Mark messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const role = req.user.role;
    // Check access permissions
    if (role === 'employee' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (role === 'it_support' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages from the other party as read by current user
    const otherPartyId = role === 'employee' ? ticket.assignedTo : ticket.createdBy;
    if (otherPartyId) {
      ticket.messages.forEach(message => {
        if (message.from.toString() === otherPartyId.toString() &&
            !message.readBy.includes(req.user._id)) {
          message.readBy.push(req.user._id);
        }
      });
      await ticket.save();
    }

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('markMessagesRead error:', err);
    res.status(500).json({ message: err.message });
  }
};

// IT/Admin: update ticket status or assign
export const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm resolution endpoint: both employee and IT support can call this.
export const confirmResolution = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { resolutionSummary, resolutionType } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Check if ticket has IT assigned (unless self-resolved)
    if (!ticket.assignedTo && resolutionType !== 'self_resolved' && resolutionType !== 'no_longer_needed') {
      return res.status(400).json({ message: "Cannot confirm ticket - no IT support assigned yet" });
    }

    const userRole = req.user.role;
    let updated = false;

    if (userRole === "employee") {
      // Only the creator can confirm as employee
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to confirm this ticket" });
      }
      ticket.resolvedByUser = true;
      ticket.resolvedByUserId = req.user._id;
      ticket.resolvedByUserAt = new Date();
      ticket.resolutionType = resolutionType;
      updated = true;
    }

    if (userRole === "it_support") {
      ticket.resolvedByIT = true;
      ticket.resolvedByITId = req.user._id;
      ticket.resolvedByITAt = new Date();
      ticket.resolutionType = resolutionType || 'it_resolved';
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ message: "Role not allowed to confirm" });
    }

    // Resolution logic based on type
    if (resolutionType === 'self_resolved' || resolutionType === 'no_longer_needed') {
      // Self-resolved or no longer needed - mark as resolved immediately
      ticket.status = "resolved";
      ticket.resolvedAt = new Date();
      ticket.resolvedByIT = true; // Mark IT as also confirmed for self-resolved
      ticket.resolvedByITId = req.user._id;
      ticket.resolvedByITAt = new Date();
    } else if (ticket.resolvedByUser && ticket.resolvedByIT) {
      // Both parties confirmed IT resolution
      ticket.status = "resolved";
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    // populate user refs for response
    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'resolvedByITId', select: 'name email' },
      { path: 'resolvedByUserId', select: 'name email' },
    ]);

    // If ticket was just resolved, optionally create a knowledge base entry so the chatbot
    // can learn from real resolutions without retraining.
    try {
      if (ticket.status === 'resolved') {
        // resolution summary can be sent in the request (recommended)
        const resolutionSummary = req.body?.resolutionSummary || '';

        // Build KB text: resolution summary if provided, otherwise use chat history + ticket description
        let kbText = '';
        if (resolutionSummary && resolutionSummary.trim()) {
          kbText = resolutionSummary.trim();
        } else {
          // Prefer a concise summary from chatHistory if available
          if (ticket.chatHistory && ticket.chatHistory.length > 0) {
            kbText = ticket.chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');
          }
          // Append ticket description
          if (!kbText || kbText.trim().length < 30) {
            kbText = (kbText ? kbText + '\n\n' : '') + `Issue: ${ticket.description}`;
          }
        }

        // Save into KB only if we have sufficient text
        if (kbText && kbText.trim().length > 20) {
          // chunk gently and run a deduplication check against already-approved KB entries
          const chunkSize = 1000;
          for (let i = 0; i < kbText.length; i += chunkSize) {
            const chunk = kbText.slice(i, i + chunkSize);

            // Check similarity against approved KB entries in memory
            try {
              const similars = await searchSimilar(chunk, 0.85);
              if (similars && similars.length > 0) {
                console.log(`⛔ Skipping ingestion for chunk — similar approved KB exists (ticket ${ticket._id})`);
                continue; // skip this chunk
              }
            } catch (simErr) {
              console.warn('Similarity check failed, proceeding to create pending KB doc', simErr.message);
            }

            // Create pending KB document (requires admin approval to be indexed)
            await KbDocument.create({ title: `Resolved: ${ticket.title}`, text: chunk, sourceTicket: ticket._id, createdBy: req.user?._id || null, approved: false });
          }

          console.log(`ℹ️ Created pending KB entries for resolved ticket ${ticket._id} (awaiting approval)`);
        }
      }
    } catch (kbErr) {
      console.error('Error ingesting resolved ticket into KB:', kbErr);
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
