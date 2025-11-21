import { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function KnowledgeBase() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/kb/text", { title, text });
      setStatus("✅ Text document uploaded successfully!");
      setTitle("");
      setText("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to upload text document");
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus("⚠️ Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/kb/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("✅ PDF uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to upload PDF");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl card p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">📚 Add Knowledge Base</h2>

        <form onSubmit={handleTextSubmit} className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
          />
          <textarea
            placeholder="Enter text content..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea w-full h-32"
          ></textarea>
          <button type="submit" className="btn-primary w-full">
            Upload Text
          </button>
        </form>

        <form onSubmit={handlePdfSubmit} className="space-y-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="input w-full"
          />
          <button type="submit" className="btn-primary w-full">
            Upload PDF
          </button>
        </form>

        {status && <p className="mt-4 text-center muted">{status}</p>}

        <button
          onClick={() => navigate("/it")}
          className="mt-6 w-full btn-ghost"
        >
          ← Back to IT Dashboard
        </button>
      </div>
    </div>
  );
}
