import React, { useState } from "react";

export default function ConfirmResolutionModal({ open, onClose, onSubmit, title = 'Confirm Resolution' }) {
  const [summary, setSummary] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit(summary);
    setSummary("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-900 text-white rounded-lg w-full max-w-md p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-3">Optional: enter a concise resolution summary to improve the knowledge base.</p>
        <textarea
          className="w-full h-28 p-2 rounded bg-slate-800 text-black border border-slate-700"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line summary (optional, recommended)"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => { setSummary(""); onClose(); }}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
