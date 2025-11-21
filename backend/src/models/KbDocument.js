import mongoose from "mongoose";

const kbSchema = new mongoose.Schema({
  title: { type: String },
  text: { type: String },        // chunked text
  docId: { type: String },       // document name/id
  vectorId: { type: Number },    // FAISS label
  metadata: { type: Object },
  sourceTicket: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model("KbDocument", kbSchema);
