import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { io } from "socket.io-client";

export default function ITDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const [ticketsRes, messagesRes] = await Promise.all([
        axios.get("/tickets/assigned"),
        axios.get("/admin/messages/it").catch(() => ({ data: [] }))
      ]);
      setTickets(ticketsRes.data);
      setMessages(messagesRes.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const markMessageRead = async (messageId) => {
    try {
      await axios.put(`/admin/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
      ));
    } catch (e) {
      console.error('Failed to mark message as read:', e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/tickets/${id}`, { status });
      fetchAssigned();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update");
    }
  };

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentConfirmTicket, setCurrentConfirmTicket] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState("");

  const openConfirm = (id) => {
    setCurrentConfirmTicket(id);
    setResolutionSummary("");
    setShowConfirmModal(true);
  };

  const doConfirm = async (summary) => {
    try {
      await axios.post(`/tickets/${currentConfirmTicket}/confirm`, { resolutionSummary: summary });
      setShowConfirmModal(false);
      setCurrentConfirmTicket(null);
      fetchAssigned();
    } catch (e) {
      setShowConfirmModal(false);
      setCurrentConfirmTicket(null);
      alert('Confirm failed');
    }
  };

  useEffect(() => { fetchAssigned(); }, []);

  // Socket.IO setup for real-time notifications
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    const userId = sessionStorage.getItem("userId");

    socket.on('connect', () => {
      console.log('IT Dashboard socket connected');
      if (userId) {
        socket.emit('joinUserRoom', { userId });
      }
    });

    socket.on('newTicketAssigned', ({ ticket }) => {
      console.log('New ticket assigned:', ticket);
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New Ticket Assigned: ${ticket.title}`, {
          body: `From: ${ticket.createdBy.name}\nPriority: ${ticket.priority}`,
          icon: '/vite.svg',
          tag: `ticket-${ticket._id}`
        });
      }

      // Refresh the tickets list
      fetchAssigned();

      // Play notification sound if supported
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Notification sound not supported');
      }
    });

    return () => {
      socket.emit('leaveUserRoom', { userId });
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="mb-4">Assigned Tickets</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg relative"
          >
            📧 Messages
            {messages.filter(m => !m.isRead).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
          <button onClick={()=> navigate("/kb")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            📚 Add Knowledge Base
          </button>
        </div>
      </div>

      {/* Admin Messages */}
      {showMessages && (
        <div className="card mb-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Messages from Admin</h3>
            {messages.length === 0 ? (
              <p className="text-slate-500">No messages from admin</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg._id} className={`border rounded p-3 ${!msg.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{msg.subject}</div>
                      {!msg.isRead && (
                        <button
                          onClick={() => markMessageRead(msg._id)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{msg.message}</p>
                    <div className="text-xs text-slate-400">
                      From: {msg.from?.name || 'Admin'} • {new Date(msg.createdAt).toLocaleString()}
                      {msg.readAt && ` • Read: ${new Date(msg.readAt).toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : tickets.length === 0 ? (
          <p className="text-slate-500">No assigned tickets.</p>
        ) : (
          <div className="grid gap-4">
            {tickets.map((t) => (
              <div key={t._id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{t.title}</h3>
                      <p className="text-slate-600 mt-1 mb-2">{t.description}</p>
                      <p className="text-xs text-slate-500">Status: {t.status}</p>
                    </div>
                    <div className="min-w-[180px] flex items-center gap-2">
                      <select
                        defaultValue={t.status}
                        onChange={(e) => updateStatus(t._id, e.target.value)}
                        className="input"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => window.location.href = `/it/tickets/${t._id}?view=details`} className="btn-ghost text-xs">View Details</button>
                          <button
                            onClick={() => window.location.href = `/it/tickets/${t._id}?view=chat`}
                            className="btn-ghost text-xs bg-blue-50 hover:bg-blue-100 relative"
                          >
                            💬 Chat
                            {t.messages && t.messages.filter(m => !m.readBy || !m.readBy.includes(sessionStorage.getItem("userId"))).length > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                !
                              </span>
                            )}
                          </button>
                        </div>
                        {!t.resolvedByIT && t.status !== 'resolved' && (
                          <>
                            <button onClick={() => openConfirm(t._id)} className="btn-primary text-xs">Confirm Resolved</button>
                          </>
                        )}
                        {t.resolvedByIT && (
                          <div className="text-xs text-slate-500">Confirmed by: {t.resolvedByITId?.name || 'IT'} {t.resolvedByITAt ? `at ${new Date(t.resolvedByITAt).toLocaleString()}` : ''}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <ConfirmModal
          show={showConfirmModal}
          title="Confirm Resolved — optional summary"
          value={resolutionSummary}
          onChange={setResolutionSummary}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={doConfirm}
          confirmLabel="Confirm"
        />
      </div>
    </div>
  );
}


