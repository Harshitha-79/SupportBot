import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function(email) {
          // Basic email format validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "it_support", "admin"],
      default: "employee",
    },
    isActive: { type: Boolean, default: true },
    // IT support account status
    isApproved: { type: Boolean, default: true },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastActive: { type: Date },
    currentStatus: { type: String, enum: ['online', 'away', 'offline'], default: 'offline' },
    
    // Attendance tracking
    attendance: [{
      date: { type: Date, required: true },
      loginTime: { type: Date, required: true },
      logoutTime: { type: Date },
      workDuration: { type: Number }, // in minutes
      ticketsResolved: { type: Number, default: 0 },
      lastActivity: { type: Date } // Track last activity during session
    }],

    // Performance metrics
    stats: {
      totalTickets: { type: Number, default: 0 },
      resolvedTickets: { type: Number, default: 0 },
      openTickets: { type: Number, default: 0 },
      avgResolutionTime: { type: Number, default: 0 }, // in minutes
      resolutionRate: { type: Number, default: 0 }, // percentage
      lastUpdated: { type: Date }
    },

    // Simple working hours profile. Example:
    // { start: '09:00', end: '17:00', breaks: [{ start: '11:00', end: '11:15' }, ...] }
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      breaks: { type: [{ start: String, end: String }], default: [] },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
