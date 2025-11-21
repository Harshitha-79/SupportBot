import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

export default function Tickets() {
   const [tickets, setTickets] = useState([]);
   const [newTicket, setNewTicket] = useState({ title: "", description: "" });
   const navigate = useNavigate();
   const role = sessionStorage.getItem("role");

   const isRecent = (ticket) => {
     if (!ticket.createdAt) return false;
     const createdAt = new Date(ticket.createdAt);
     const now = new Date();
     const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
     return diffDays <= 7; // Consider tickets created within last 7 days as recent
   };

  const fetchTickets = async () => {
    try {
      const endpoint = role === "admin" ? "/admin/tickets" : "/tickets/my";
      console.log('DEBUG: Fetching tickets from', endpoint);
      const res = await axios.get(endpoint);
      console.log('DEBUG: Tickets response:', res.data);
      setTickets(res.data);
    } catch (err) {
      console.error('DEBUG: Error fetching tickets:', err);
    }
  };

  const handleConfirm = async (ticketId) => {
    // Open modal for confirmation
    setCurrentConfirmTicket(ticketId);
    setResolutionSummary("");
    setShowConfirmModal(true);
  };

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentConfirmTicket, setCurrentConfirmTicket] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState("");

  const doConfirm = async (summary) => {
    try {
      await axios.post(`/tickets/${currentConfirmTicket}/confirm`, { resolutionSummary: summary });
      setShowConfirmModal(false);
      setCurrentConfirmTicket(null);
      fetchTickets();
    } catch (err) {
      console.error("Confirm error:", err.message);
      alert("Could not confirm resolution. Please try again.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/tickets", newTicket);
      const createdTicket = response.data;
      setNewTicket({ title: "", description: "" });
      // Navigate to the newly created ticket for immediate chat access
      navigate(`/tickets/${createdTicket._id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  useEffect(() => {
    if (role !== "employee" && role !== "admin") {
      window.location.href = "/it";
      return;
    }
    fetchTickets();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-4xl">
         <h2 className="mb-4">{role === "admin" ? "All Tickets" : "My Tickets"}</h2>

        {role !== "admin" && (
          <form onSubmit={handleCreate} className="card mb-6">
            <div className="card-body">
              <input className="input mb-2" placeholder="Title"
              value={newTicket.title} onChange={(e)=>setNewTicket({...newTicket,title:e.target.value})}/>
              <textarea className="textarea mb-3" placeholder="Description"
              value={newTicket.description} onChange={(e)=>setNewTicket({...newTicket,description:e.target.value})}/>
              <button className="btn-primary">Create Ticket</button>
            </div>
          </form>
        )}

        {tickets.length === 0 ? (
          <p className="text-slate-500 text-center">No tickets yet.</p>
        ) : (
          <div className="grid gap-4">
            {tickets.map((t) => (
              <div key={t._id} className="card" onClick={() => navigate(`/tickets/${t._id}`)} style={{ cursor: 'pointer' }}>
                <div className="card-body">
                  <h3 className="font-semibold text-slate-900">{t.title}</h3>
                  <p className="text-slate-600 mt-1 mb-2">{t.description}</p>
                  <div className="text-xs text-slate-500">
                    <p>Status: {t.status}</p>
                    <p>Assigned to: {t.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  {/* Enhanced status and resolution info */}
                  <div className="text-xs text-slate-500 mt-1 space-y-1">
                    {t.resolutionType && (
                      <div className="font-medium">
                        {t.resolutionType === 'it_resolved' && '✅ Resolved by IT Support'}
                        {t.resolutionType === 'self_resolved' && '🛠️ Self-Resolved'}
                        {t.resolutionType === 'no_longer_needed' && '❌ No Longer Needed'}
                      </div>
                    )}

                    {t.confirmationRequests && t.confirmationRequests.length > 0 && (
                      <div className="text-orange-400">
                        📞 Confirmation requested {t.confirmationRequests.length} time(s)
                      </div>
                    )}

                    {t.resolvedByUser || t.resolvedByIT ? (
                      <>
                        <div>Employee: {t.resolvedByUser ? `You ✅` : 'You ❌'} {t.resolvedByUserAt ? `at ${new Date(t.resolvedByUserAt).toLocaleString()}` : ''}</div>
                        <div>IT: {t.resolvedByIT ? `${t.resolvedByITId?.name || 'IT'} ✅` : 'IT ❌'} {t.resolvedByITAt ? `at ${new Date(t.resolvedByITAt).toLocaleString()}` : ''}</div>
                      </>
                    ) : null}

                    {/* Show last message preview */}
                    {t.messages && t.messages.length > 0 && (
                      <div className="text-gray-400 italic">
                        💬 Last: {t.messages[t.messages.length - 1].text?.substring(0, 50)}{t.messages[t.messages.length - 1].text?.length > 50 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  {/* Chat button for active tickets or recent resolved tickets */}
                  {(t.status !== "resolved" || isRecent(t)) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="btn-primary text-sm px-3 py-1"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          navigate(`/tickets/${t._id}`);
                        }}
                      >
                        💬 Chat
                      </button>
                      {role === "employee" && !t.resolvedByUser && t.assignedTo && (
                        <button
                          className="btn-secondary text-sm px-3 py-1"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleConfirm(t._id);
                          }}
                        >
                          ✓ Confirm Resolved
                        </button>
                      )}
                    </div>
                  )}

                  {/* For resolved tickets, show at bottom */}
                  {t.status === "resolved" && (
                    <div className="mt-3 text-center">
                      <span className="text-green-600 font-medium text-sm">✅ Ticket Resolved</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          show={showConfirmModal}
          title="Confirm Ticket Resolution"
          value={resolutionSummary}
          onChange={setResolutionSummary}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={doConfirm}
          confirmLabel="Confirm Resolved"
        />
      </div>
    </div>
  );
}

