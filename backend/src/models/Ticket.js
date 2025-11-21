import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: { type: Date },
    expectedResolutionAt: { type: Date },
    // chat history (optional) - array of messages captured when ticket was created
    chatHistory: {
      type: [
        {
          role: { type: String },
          text: { type: String },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    }, 
    // live messages exchanged between user and IT support after ticket creation
    messages: {
      type: [
        {
          from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          text: { type: String },
          attachments: [{
            filename: { type: String },
            originalName: { type: String },
            mimetype: { type: String },
            size: { type: Number },
            url: { type: String }
          }],
          readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
          at: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    // Two-sided confirmation flags and who/when confirmed
    resolvedByUser: { type: Boolean, default: false },
    resolvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedByUserAt: { type: Date },
    resolvedByIT: { type: Boolean, default: false },
    resolvedByITId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedByITAt: { type: Date },
    resolvedAt: { type: Date },

    // Confirmation request tracking
    confirmationRequests: [{
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'responded'], default: 'pending' }
    }],

    // Resolution type tracking
    resolutionType: {
      type: String,
      enum: ['it_resolved', 'self_resolved', 'no_longer_needed', 'cancelled'],
      default: null
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
