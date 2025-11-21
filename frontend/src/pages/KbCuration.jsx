import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";

export default function KbCuration() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarMap, setSimilarMap] = useState({}); // id -> array of similar docs

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/kb/pending');
      setPending(res.data);
    } catch (e) {
      alert('Failed to load pending KB entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    try {
      await axios.post(`/kb/${id}/approve`);
      fetchPending();
    } catch (e) {
      if (e.response?.status === 409) {
        alert('Similar approved KB entry exists. Please review before approving.');
      } else {
        alert('Approve failed');
      }
    }
  };

  const fetchSimilar = async (id) => {
    try {
      // Use dryRun query to get similar approved docs without approving
      const res = await axios.post(`/kb/${id}/approve?dryRun=true`);
      const similar = res.data.similar || [];
      setSimilarMap((m) => ({ ...m, [id]: similar }));
    } catch (e) {
      // If server responds with 409, the response body may contain similar items
      const similar = e.response?.data?.similar || [];
      setSimilarMap((m) => ({ ...m, [id]: similar }));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this KB entry?')) return;
    try {
      await axios.delete(`/kb/${id}`);
      fetchPending();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-4xl">
        <h2 className="mb-4">KB Curation (Pending)</h2>
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-slate-500">No pending KB entries.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((p) => (
              <div key={p._id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{p.title || 'Untitled'}</h3>
                      <p className="text-slate-600 text-sm mt-2 whitespace-pre-wrap">{p.text}</p>
                      <div className="text-xs text-slate-500 mt-2">Submitted: {new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="btn-primary" onClick={() => approve(p._id)}>Approve & Index</button>
                      <button className="btn-ghost" onClick={() => remove(p._id)}>Delete</button>
                      <button className="btn-ghost" onClick={() => fetchSimilar(p._id)}>Show similar</button>
                    </div>
                  </div>
                </div>
                {similarMap[p._id] && similarMap[p._id].length > 0 && (
                  <div className="p-4 border-t border-slate-700 bg-slate-800 text-slate-100">
                    <div className="text-sm font-medium mb-2">Similar approved KB entries:</div>
                    <ul className="list-disc list-inside space-y-2">
                      {similarMap[p._id].map((s, i) => (
                        <li key={i} className="text-sm">
                          <div className="font-semibold">{s.doc.title || 'Untitled'}</div>
                          <div className="text-xs text-slate-300 whitespace-pre-wrap">{(s.doc.text || '').slice(0, 240)}{(s.doc.text || '').length > 240 ? '...' : ''}</div>
                          <div className="text-xs text-slate-400 mt-1">Score: {(s.score || 0).toFixed(3)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
