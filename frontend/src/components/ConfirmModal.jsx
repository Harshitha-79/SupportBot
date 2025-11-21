import React, { useState } from 'react';

export default function ConfirmModal({
  show,
  title,
  value,
  onChange,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  showResolutionTypes = false,
  role = 'employee'
}) {
  const [resolutionType, setResolutionType] = useState('it_resolved');

  if (!show) return null;

  const resolutionOptions = role === 'employee' ? [
    { value: 'it_resolved', label: '✅ IT Support Resolved My Issue' },
    { value: 'self_resolved', label: '🛠️ I Resolved It Myself' },
    { value: 'no_longer_needed', label: '❌ No Longer Needed' }
  ] : [
    { value: 'it_resolved', label: '✅ Issue Resolved by IT Support' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4 space-y-4">
          {showResolutionTypes && (
            <div>
              <label className="block text-sm font-medium mb-2">Resolution Type:</label>
              <select
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
              >
                {resolutionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Resolution Summary (Optional):</label>
            <textarea
              value={value}
              onChange={(e)=>onChange(e.target.value)}
              className="w-full h-32 bg-gray-800 text-white border border-gray-700 rounded p-2"
              placeholder="Brief summary of how the issue was resolved (helps improve our knowledge base)"
            />
          </div>
        </div>
        <div className="p-3 flex justify-end gap-2 border-t border-gray-800">
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
          <button
            onClick={() => onConfirm(value, resolutionType)}
            className="btn-primary"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
