import React, { useState } from 'react';

export default function CreateTicketModal({ open, initialText = '', onClose, onCreate }) {
  const [text, setText] = useState(initialText);

  // keep text synced if initialText changes
  React.useEffect(() => setText(initialText), [initialText]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-900 text-white rounded-lg w-full max-w-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Create support ticket</h3>
        <p className="text-sm text-slate-300 mb-3">Edit the problem description below then click Create to file a ticket. The full chat history will be included.</p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2"
          placeholder="One-line summary (title)"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-28 p-2 rounded bg-slate-800 border border-slate-700 text-black"
          placeholder="Full problem description"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => onCreate(text)}
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
