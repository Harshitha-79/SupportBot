import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    default: 'user'
  }
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [chatMessageSchema],
    lastActivity: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
);

// Index for efficient queries
chatSessionSchema.index({ userId: 1, lastActivity: -1 });

export default mongoose.model("ChatSession", chatSessionSchema);