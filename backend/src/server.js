import app from "./app.js";
import connectDB from "./config/db.js";
import { loadFromDatabase } from "./utils/faissUtils.js";
import KbDocument from "./models/KbDocument.js";
import Ticket from "./models/Ticket.js";
import User from "./models/User.js";
import { sendNotification } from "./utils/notify.js";
import { Server as SocketIOServer } from "socket.io";

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error(err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error(err.stack);
  process.exit(1);
});

// Initialize and start server
const startServer = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    
    console.log("🔄 Loading knowledge base...");
    try {
      await loadFromDatabase(KbDocument);
    } catch (kbError) {
      console.warn("⚠️ Warning: Could not load knowledge base:", kbError.message);
      console.warn("   Server will continue, but chatbot may not work until KB is loaded");
    }
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 Ready to accept connections`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });

    // Initialize Socket.IO for real-time chat
    const io = new SocketIOServer(server, {
      cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST']
      }
    });

    // Expose io globally for controllers
    global.io = io;

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('joinUserRoom', ({ userId }) => {
        if (!userId) return;
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user room user_${userId}`);
      });

      socket.on('leaveUserRoom', ({ userId }) => {
        if (!userId) return;
        socket.leave(`user_${userId}`);
      });

      socket.on('joinTicket', ({ ticketId }) => {
        if (!ticketId) return;
        socket.join(`ticket_${ticketId}`);
        console.log(`Socket ${socket.id} joined room ticket_${ticketId}`);
      });

      socket.on('leaveTicket', ({ ticketId }) => {
        if (!ticketId) return;
        socket.leave(`ticket_${ticketId}`);
      });

      socket.on('typing', ({ ticketId, userId, isTyping }) => {
        if (!ticketId || !userId) return;
        socket.to(`ticket_${ticketId}`).emit('userTyping', { userId, isTyping });
      });

      socket.on('sendMessage', async ({ ticketId, text, userId }) => {
        try {
          if (!ticketId || !text || !userId) return;
          const ticket = await Ticket.findById(ticketId);
          if (!ticket) return;

          // append message
          ticket.messages.push({ from: userId, text: text.trim(), at: new Date() });
          // if IT replies, set status to in_progress
          const sender = await User.findById(userId);
          if (sender?.role === 'it_support' && ticket.status === 'open') {
            ticket.status = 'in_progress';
          }
          await ticket.save();
          await ticket.populate({ path: 'messages.from', select: 'name email' });
          const lastMsg = ticket.messages[ticket.messages.length - 1];

          // emit to room
          io.to(`ticket_${ticketId}`).emit('newMessage', { message: lastMsg, ticketId });

          // notify other party (best effort)
          try {
            if (sender?.role === 'it_support' && ticket.createdBy) {
              const user = await User.findById(ticket.createdBy);
              if (user?.email) {
                await sendNotification({
                  to: user.email,
                  template: 'simple',
                  data: { message: `IT replied on your ticket ${ticket._id}: ${lastMsg.text}` }
                });
              }
            } else if (sender?.role === 'employee' && ticket.assignedTo) {
              const itUser = await User.findById(ticket.assignedTo);
              if (itUser?.email) {
                await sendNotification({
                  to: itUser.email,
                  template: 'simple',
                  data: { message: `New message on ticket ${ticket._id} from requester: ${lastMsg.text}` }
                });
              }
            }
          } catch (notifyErr) {
            console.warn('Socket message notification failed:', notifyErr?.message || notifyErr);
          }
        } catch (err) {
          console.error('Socket sendMessage error:', err);
        }
      });

      // Video call signaling
      socket.on('startCall', ({ ticketId, type, from }) => {
        if (!ticketId) return;
        socket.to(`ticket_${ticketId}`).emit('incomingCall', { from, ticketId });
      });

      socket.on('acceptCall', ({ ticketId, from }) => {
        if (!ticketId) return;
        socket.to(`ticket_${ticketId}`).emit('callAccepted', { ticketId });
      });

      socket.on('rejectCall', ({ ticketId, from }) => {
        if (!ticketId) return;
        socket.to(`ticket_${ticketId}`).emit('callRejected', { ticketId });
      });

      socket.on('endCall', ({ ticketId }) => {
        if (!ticketId) return;
        socket.to(`ticket_${ticketId}`).emit('callEnded', { ticketId });
      });

      // WebRTC signaling
      socket.on('offer', ({ ticketId, offer }) => {
        if (!ticketId || !offer) return;
        socket.to(`ticket_${ticketId}`).emit('offer', { offer });
      });

      socket.on('answer', ({ ticketId, answer }) => {
        if (!ticketId || !answer) return;
        socket.to(`ticket_${ticketId}`).emit('answer', { answer });
      });

      socket.on('ice-candidate', ({ ticketId, candidate }) => {
        if (!ticketId || !candidate) return;
        socket.to(`ticket_${ticketId}`).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(`   Please stop the other server or use a different port`);
        console.error(`   Try: lsof -ti:${PORT} | xargs kill (Mac/Linux)`);
        console.error(`   Or: netstat -ano | findstr :${PORT} (Windows)`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();
