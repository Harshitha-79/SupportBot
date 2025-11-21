// src/utils/faissUtils.js
import fs from "fs";
import { pipeline } from "@xenova/transformers";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local FAISS-like memory
let embeddings = [];
let documents = [];

// Load sentence embedding model (runs locally)
const embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export const embedText = async (text) => {
  const embedder = await embedderPromise;
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

export const addVector = async (vector, document = null) => {
  embeddings.push(vector);
  documents.push(document || { text: "", title: "" });
};

export const saveIndex = () => {
  const indexPath = path.join(__dirname, "../../faiss_index.json");
  try {
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ embeddings, documents }, null, 2)
    );
    console.log("✅ Local FAISS index saved (JSON)");
  } catch (error) {
    console.error("Error saving index:", error.message);
  }
};

export const loadIndex = () => {
  const indexPath = path.join(__dirname, "../../faiss_index.json");
  try {
    if (fs.existsSync(indexPath)) {
      const data = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      embeddings = data.embeddings || [];
      documents = data.documents || [];
      console.log(`✅ Loaded ${embeddings.length} embeddings from index file`);
      return true;
    }
  } catch (error) {
    console.error("Error loading index:", error.message);
  }
  return false;
};

export const loadFromDatabase = async (KbDocumentModel) => {
  try {
    // Only load documents that have been approved by an admin/curator
    const docs = await KbDocumentModel.find({ approved: true });
    if (docs.length === 0) {
      console.log("⚠️ No documents in database to load");
      return;
    }
    
    console.log(`📚 Loading ${docs.length} documents from database...`);
    embeddings = [];
    documents = [];
    
    console.log("🔄 Initializing embedding model (this may take a moment on first run)...");
    const embedder = await embedderPromise;
    console.log("✅ Embedding model ready");
    
    let loaded = 0;
    for (const doc of docs) {
      if (doc.text && doc.text.trim()) {
        try {
          const output = await embedder(doc.text, { pooling: "mean", normalize: true });
          const vector = Array.from(output.data);
          embeddings.push(vector);
          documents.push({ 
            text: doc.text, 
            title: doc.title || "Untitled",
              _id: doc._id.toString(),
              sourceTicket: doc.sourceTicket || null
          });
          loaded++;
        } catch (err) {
          console.warn(`⚠️ Failed to embed document "${doc.title || doc._id}":`, err.message);
        }
      }
    }
    
    console.log(`✅ Loaded ${loaded} embeddings from database`);
    if (loaded > 0) {
      saveIndex();
    }
  } catch (error) {
    console.error("❌ Error loading from database:", error.message);
    throw error; // Re-throw so server can handle it
  }
};

export const searchSimilar = async (query, minScore = 0.3) => {
  if (embeddings.length === 0) {
    console.log("⚠️ No embeddings in memory for search");
    return [];
  }
  
  const queryVec = await embedText(query);
  const similarities = embeddings.map((vec, i) => ({
    score: cosineSimilarity(vec, queryVec),
    doc: documents[i],
  }));

  const filtered = similarities
    .filter(item => item.score >= minScore && item.doc && item.doc.text)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
    
  return filtered;
};

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
};
