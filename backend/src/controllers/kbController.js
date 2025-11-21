// import KbDocument from "../models/KbDocument.js";
// import { embedText, addVector, saveIndex } from "../utils/faissUtils.js";

// import fs from "fs";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse");


// const chunkText = (text, size = 1000, overlap = 200) => {
//   const chunks = [];
//   for (let i = 0; i < text.length; i += size - overlap) {
//     chunks.push(text.slice(i, i + size));
//   }
//   return chunks;
// };

// export const ingestText = async (req, res) => {
//   try {
//     const { title, text } = req.body;
//     if (!text || !text.trim()) {
//       return res.status(400).json({ error: "Text is required" });
//     }
    
//     const chunks = chunkText(text);
//     for (const chunk of chunks) {
//       if (chunk.trim()) {
//         const vec = await embedText(chunk);
//         const kbDoc = await KbDocument.create({ title, text: chunk });
//         await addVector(vec, { 
//           text: chunk, 
//           title: title || "Untitled",
//           _id: kbDoc._id.toString()
//         });
//       }
//     }
//     saveIndex();
//     res.status(201).json({ message: "Text ingested", chunks: chunks.length });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// // export const ingestPdf = async (req, res) => {
// //   try {
// //     const data = await pdfParse(fs.readFileSync(req.file.path));
// //     fs.unlinkSync(req.file.path);
// //     req.body.title = req.file.originalname;
// //     req.body.text = data.text;
// //     return ingestText(req, res);
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// //};


import fs from "fs";
import pdfParse from "pdf-parse-fixed"; // ✅ ESM-compatible PDF parser
import KbDocument from "../models/KbDocument.js";
import { embedText, addVector, saveIndex } from "../utils/faissUtils.js";
import { searchSimilar } from "../utils/faissUtils.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

/**
 * Splits text into overlapping chunks for embedding.
 */
const chunkText = (text, size = 1000, overlap = 200) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

/**
 * Ingest plain text into the knowledge base.
 */
export const ingestText = async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const isAdmin = req.user?.role === 'admin';
    const chunks = chunkText(text);
    let savedCount = 0;

    for (const chunk of chunks) {
      if (chunk.trim()) {
        const approved = isAdmin; // Auto-approve if admin
        const kbDoc = await KbDocument.create({
          title,
          text: chunk,
          createdBy: req.user?._id || null,
          approved
        });

        if (approved) {
          // Immediately add to vector index for admins
          const vec = await embedText(chunk);
          await addVector(vec, {
            text: chunk,
            title: title || "Untitled",
            _id: kbDoc._id.toString()
          });
        }
        savedCount++;
      }
    }

    if (isAdmin) {
      saveIndex();
      console.log(`✅ Text ingested and auto-approved (${savedCount} chunks)`);
      res.status(201).json({ message: "Text ingested and approved", chunks: savedCount });
    } else {
      console.log(`✅ Text ingested and saved as pending (${savedCount} chunks)`);
      res.status(201).json({ message: "Text ingested (pending review)", chunks: savedCount });
    }
  } catch (e) {
    console.error("❌ Error in ingestText:", e);
    res.status(500).json({ error: e.message });
  }
};

/**
 * Ingest a PDF file into the knowledge base.
 */
export const ingestPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📂 Received file:", req.file);

    const filePath = req.file.path;
    console.log("📖 Reading file at:", filePath);

    const fileBuffer = fs.readFileSync(filePath);
    console.log("✅ File read successfully, size:", fileBuffer.length);

    const data = await pdfParse(fileBuffer);
    console.log("📄 Extracted text length:", data.text?.length || 0);

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    console.log("🗑️ Deleted temp file");

    // Prepare text ingestion
    req.body.title = req.file.originalname;
    req.body.text = data.text;

    return ingestText(req, res);
  } catch (e) {
    console.error("❌ Error in ingestPdf:", e);
    res.status(500).json({ error: e.message });
  }
};

// Admin: list pending KB entries (not yet approved)
export const listPendingKb = async (req, res) => {
  try {
    const pending = await KbDocument.find({ approved: false }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Admin: approve a KB entry — embed it and add it to the in-memory index
export const approveKb = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await KbDocument.findById(id);
    if (!doc) return res.status(404).json({ message: "KB doc not found" });

    // Avoid double-approving
    if (doc.approved) return res.json({ message: "Already approved" });

    // If dryRun is requested, return similar approved docs without actually approving
    const similars = await searchSimilar(doc.text, 0.85);
    if (req.query && req.query.dryRun === 'true') {
      return res.json({ similar: similars || [] });
    }

    // Dedup check against current approved docs
    if (similars && similars.length > 0) {
      // Too similar to existing approved doc — do not add; return info to admin
      return res.status(409).json({ message: "Similar approved KB entry exists", similar: similars });
    }

    const vec = await embedText(doc.text);
    await addVector(vec, { text: doc.text, title: doc.title || "Untitled", _id: doc._id.toString() });
    doc.approved = true;
    doc.approvedBy = req.user?._id || null;
    await doc.save();
    saveIndex();
    res.json({ message: "Approved and indexed", doc });
  } catch (e) {
    console.error("❌ Error approving KB doc:", e);
    res.status(500).json({ error: e.message });
  }
};

// Admin: delete a pending/any KB entry
export const deleteKb = async (req, res) => {
  try {
    const id = req.params.id;
    await KbDocument.findByIdAndDelete(id);
    // Note: If it was indexed, it will still be in memory/disk index. For simplicity, operator can reload index after deletions.
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



