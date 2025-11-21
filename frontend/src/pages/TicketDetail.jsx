import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { io } from "socket.io-client";

// Video Call Component
const VideoCallModal = ({ isOpen, onClose, ticketId, remoteUser, socket, onEndCall }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (isOpen && isInCall) {
      startCall();
    } else if (!isOpen) {
      endCall();
    }

    // Cleanup on unmount or close
    return () => {
      endCall();
    };
  }, [isOpen, isInCall]);

  // Socket listeners for video call signaling
  useEffect(() => {
    if (socket && isOpen) {
      const handleIncomingCall = ({ from, ticketId: tId }) => {
        if (tId === ticketId) {
          setIncomingCall(true);
          setCaller(from);
          // Play ring sound for incoming call
          playRingSound();
        }
      };

      const handleCallAccepted = async ({ ticketId: tId }) => {
        if (tId === ticketId) {
          setIsInCall(true);
          // Set up peer connection for receiver
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: isVideoEnabled,
              audio: isAudioEnabled
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }

            const configuration = {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            };

            peerConnectionRef.current = new RTCPeerConnection(configuration);

            stream.getTracks().forEach(track => {
              peerConnectionRef.current.addTrack(track, stream);
            });

            peerConnectionRef.current.ontrack = (event) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
              }
            };

            peerConnectionRef.current.onicecandidate = (event) => {
              if (event.candidate && socket) {
                socket.emit('ice-candidate', { ticketId, candidate: event.candidate });
              }
            };
          } catch (error) {
            console.error('Error setting up call:', error);
            alert('Could not access camera/microphone. Please check permissions.');
          }
        }
      };

      const handleCallRejected = ({ ticketId: tId }) => {
        if (tId === ticketId) {
          setIncomingCall(false);
          alert('Call was rejected');
        }
      };

      const handleCallEnded = ({ ticketId: tId }) => {
        if (tId === ticketId) {
          endCall();
        }
      };

      const handleOffer = async ({ offer }) => {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('answer', { ticketId, answer });
      };

      const handleAnswer = async ({ answer }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      };

      const handleIceCandidate = ({ candidate }) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      };

      socket.on('incomingCall', handleIncomingCall);
      socket.on('callAccepted', handleCallAccepted);
      socket.on('callRejected', handleCallRejected);
      socket.on('callEnded', handleCallEnded);
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);

      return () => {
        socket.off('incomingCall', handleIncomingCall);
        socket.off('callAccepted', handleCallAccepted);
        socket.off('callRejected', handleCallRejected);
        socket.off('callEnded', handleCallEnded);
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('ice-candidate', handleIceCandidate);
      };
    }
  }, [socket, isOpen, ticketId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', { ticketId, candidate: event.candidate });
        }
      };

      // Create offer and send to remote peer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      if (socket) {
        socket.emit('offer', { ticketId, offer });
      }

    } catch (error) {
      console.error('Error starting call:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const endCall = () => {
    console.log('Ending call');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsInCall(false);
    setIncomingCall(false);
    if (socket) socket.emit('endCall', { ticketId });
    if (onEndCall) onEndCall();
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isInCall ? `Call with ${remoteUser}` : 'Start Call'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!isInCall ? (
           <div className="text-center py-8">
             {incomingCall ? (
               <>
                 <div className="text-6xl mb-4">📞</div>
                 <p className="text-gray-600 mb-2">Incoming call from {caller?.name || 'IT Support'}</p>
                 <div className="flex gap-4 justify-center">
                   <button
                     onClick={() => {
                       setIncomingCall(false);
                       setIsInCall(true);
                       if (socket) socket.emit('acceptCall', { ticketId });
                     }}
                     className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                   >
                     ✅ Accept Call
                   </button>
                   <button
                     onClick={() => {
                       setIncomingCall(false);
                       if (socket) socket.emit('rejectCall', { ticketId });
                     }}
                     className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                   >
                     ❌ Reject Call
                   </button>
                 </div>
               </>
             ) : (
               <>
                 <div className="text-6xl mb-4">📞</div>
                 <p className="text-gray-600 mb-6">Ready to start a call?</p>
                 <div className="flex gap-4 justify-center">
                   <button
                     onClick={() => {
                       setIsInCall(true);
                       if (socket) socket.emit('startCall', { ticketId, type: 'video' });
                     }}
                     className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                   >
                     📹 Start Video Call
                   </button>
                   <button
                     onClick={() => {
                       setIsInCall(true);
                       if (socket) socket.emit('startCall', { ticketId, type: 'audio' });
                     }}
                     className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                   >
                     📞 Start Audio Call
                   </button>
                 </div>
               </>
             )}
           </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-48 bg-gray-200 rounded-lg object-cover"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </div>
              </div>
              <div className="relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-48 bg-gray-200 rounded-lg object-cover"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {remoteUser}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isAudioEnabled
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isVideoEnabled
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isVideoEnabled ? '📹' : '📷'}
              </button>
              <button
                onClick={endCall}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                📞 End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TicketDetail() {
   const { id } = useParams();
   console.log('TicketDetail component rendered with id:', id);
   const [ticket, setTicket] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    desktopNotifications: 'granted',
    vibrationEnabled: true
  });
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("userId");
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Get view mode from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const viewMode = urlParams.get('view') || 'chat'; // Default to chat for backward compatibility

  const commonEmojis = ['😊', '👍', '👎', '✅', '❌', '🚀', '💻', '📱', '🔧', '📎', '📁', '📄'];

  // Simple AI suggestions based on keywords
  const getSuggestions = (text) => {
    const lowerText = text.toLowerCase();
    const suggestions = [];

    if (lowerText.includes('password')) {
      suggestions.push('Try resetting your password through the login page.');
    }
    if (lowerText.includes('vpn')) {
      suggestions.push('Check your VPN connection and credentials.');
    }
    if (lowerText.includes('slow') || lowerText.includes('lag')) {
      suggestions.push('Clear cache and restart your computer.');
    }
    if (lowerText.includes('error') || lowerText.includes('crash')) {
      suggestions.push('Check event logs for error details.');
    }

    return suggestions.slice(0, 2); // Max 2 suggestions
  };

  // Enhanced notification system initialization
  useEffect(() => {
    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }

    // Request notification permission for IT staff
    if ('Notification' in window && Notification.permission === 'default' && role === 'it_support') {
      const timer = setTimeout(() => {
        Notification.requestPermission().then(permission => {
          setNotificationSettings(prev => ({ ...prev, desktopNotifications: permission }));
        });
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Update settings when permission changes
    if ('Notification' in window) {
      setNotificationSettings(prev => ({ ...prev, desktopNotifications: Notification.permission }));
    }
  }, [role]);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Enhanced notification system with user preferences
  const showNotification = (message, sender, ticketTitle) => {
    // Check if notifications are enabled in user settings
    if (!notificationSettings.desktopNotifications || notificationSettings.desktopNotifications !== 'granted') {
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      // Play notification sound if enabled
      if (notificationSettings.soundEnabled) {
        playNotificationSound();
      }

      // Trigger vibration on mobile devices
      if (notificationSettings.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // Double vibration pattern
      }

      const notification = new Notification(`💬 ${ticketTitle}`, {
        body: `${sender}: ${message}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `it-support-${ticketTitle}`, // Group by ticket
        requireInteraction: false,
        silent: !notificationSettings.soundEnabled
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Click to focus window and navigate to ticket
      notification.onclick = () => {
        window.focus();
        // Could navigate to specific ticket if needed
        notification.close();
      };
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Fallback: no sound if Web Audio API not supported
      console.log('Notification sound not supported');
    }
  };

  // Play ring sound for video call
  const playRingSound = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a ringing sound pattern
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.6);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (e) {
      console.log('Ring sound not supported');
    }
  };

  const fetchTicket = async () => {
    try {
      console.log('DEBUG: Fetching ticket with id:', id);
      setLoading(true);
      setError(null);
      const res = await axios.get(`/tickets/${id}`);
      console.log('DEBUG: Ticket fetched successfully:', res.data);
      setTicket(res.data);
    } catch (e) {
      console.error('DEBUG: Failed to load ticket:', e);
      console.error('DEBUG: Error details:', e.response?.data, e.response?.status);
      setError(e.response?.data?.message || "Failed to load ticket");
      // Don't navigate immediately, show error instead
    } finally {
      console.log('DEBUG: Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  // Socket.IO setup for real-time chat
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('DEBUG: Socket connected to ticket:', id);
      socket.emit('joinTicket', { ticketId: id });
    });

    socket.on('disconnect', () => {
      console.log('DEBUG: Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('DEBUG: Socket connection error:', error);
    });

    socket.on('newMessage', ({ message, ticketId: tId }) => {
      console.log('DEBUG: Received new message:', message, 'for ticket:', tId);
      if (tId !== id) return;
      setTicket(prev => {
        if (!prev) return prev;
        return { ...prev, messages: [...(prev.messages || []), message] };
      });
      // Show notification for new messages
      showNotification(message.text || 'New message with attachment', message.from?.name || 'IT Support', ticket.title);
    });

    socket.on('userTyping', ({ userId: typingUserId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(typingUserId);
        } else {
          newSet.delete(typingUserId);
        }
        return newSet;
      });
    });

    return () => {
      socket.emit('leaveTicket', { ticketId: id });
      socket.disconnect();
    };
  }, [id]);
  // Poll for new messages every 30 seconds (reduced frequency to prevent blinking)
  useEffect(() => {
    const iv = setInterval(() => {
      fetchTicket();
    }, 30000); // Changed from 5000ms to 30000ms
    return () => clearInterval(iv);
  }, [id]);

  // Mark messages as read when component mounts or when new messages arrive
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await axios.post(`/tickets/${id}/read`);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    };

    if (ticket && ticket.messages && ticket.messages.length > 0) {
      markAsRead();
    }
  }, [id, ticket?.messages?.length]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit('typing', { ticketId: id, userId, isTyping: true });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('typing', { ticketId: id, userId, isTyping: false });
        }
      }, 1000);
    }
  };

  const handleConfirm = async () => {
    // Open modal instead
    setResolutionSummary("");
    setShowConfirmModal(true);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");

  const doConfirm = async (summary, resolutionType) => {
    try {
      await axios.post(`/tickets/${id}/confirm`, {
        resolutionSummary: summary,
        resolutionType: resolutionType
      });
      setShowConfirmModal(false);
      fetchTicket();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to confirm resolution";
      if (errorMsg.includes("no IT support assigned")) {
        alert("This ticket needs to be assigned to IT support before it can be confirmed as resolved.");
      } else {
        alert(errorMsg);
      }
    }
  };

  // Filter messages based on search term
  const filteredMessages = ticket?.messages ? ticket.messages.filter(m =>
    m.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.attachments?.some(att => att.originalName?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  if (loading) return (
    <div>
      <Navbar />
      <div className="container-page py-8">Loading…</div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="container-page py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Ticket</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  if (!ticket) return (
    <div>
      <Navbar />
      <div className="container-page py-8">Loading ticket data…</div>
    </div>
  );

  // Render different views based on viewMode
  if (viewMode === 'details') {
    // Traditional ticket details view
    return (
      <div>
        <Navbar />
        <div className="container-page py-8 max-w-3xl">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900">
            ← Back
          </button>
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold">{ticket.title}</h2>
              <p className="text-slate-600 mt-2">{ticket.description}</p>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <p>Status: {ticket.status}</p>
                <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                <p>Assigned to: {ticket.assignedTo?.name || 'Unassigned'}</p>
                <p>Created by: {ticket.createdBy?.name || 'Unknown'}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium">Chat history</h3>
                <div className="mt-2 space-y-2">
                  {/* initial captured chatHistory (at creation) */}
                  {ticket.chatHistory && ticket.chatHistory.length > 0 && ticket.chatHistory.map((m, i) => (
                    <div key={`h-${i}`} className={`p-2 rounded ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                      <div className="text-sm text-slate-700">{m.text}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(m.at).toLocaleString()}</div>
                    </div>
                  ))}

                  {/* live messages */}
                  {ticket.messages && ticket.messages.length > 0 ? (
                    ticket.messages.map((m, i) => (
                      <div key={`m-${i}`} className={`p-2 rounded ${m.from && m.from._id === ticket.createdBy?._id ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <div className="text-sm text-slate-700"><strong>{m.from?.name || (m.from?.email) || 'IT Support'}</strong>: {m.text}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(m.at).toLocaleString()}</div>
                      </div>
                    ))
                  ) : null}
                  {(!ticket.chatHistory || ticket.chatHistory.length === 0) && (!ticket.messages || ticket.messages.length === 0) && (
                    <p className="text-slate-500">No chat history available.</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-slate-600">Confirmations:</p>
                <ul className="text-sm text-slate-600 list-inside list-disc mt-2">
                  <li>Employee: {ticket.resolvedByUser ? `You ✅ at ${ticket.resolvedByUserAt ? new Date(ticket.resolvedByUserAt).toLocaleString() : ''}` : 'You ❌'}</li>
                  <li>IT: {ticket.resolvedByIT ? `${ticket.resolvedByITId?.name || 'IT'} ✅ at ${ticket.resolvedByITAt ? new Date(ticket.resolvedByITAt).toLocaleString() : ''}` : 'IT ❌'}</li>
                </ul>
              </div>

              {((role === 'employee' && !ticket.resolvedByUser) || (role === 'it_support' && !ticket.resolvedByIT)) && ticket.status !== 'resolved' && (
                <div className="mt-4">
                  {!ticket.assignedTo && role === 'employee' ? (
                    <div className="p-3 bg-orange-50 text-orange-700 rounded-lg">
                      ⚠️ This ticket needs to be assigned to IT support before it can be confirmed as resolved.
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={handleConfirm}>Confirm Resolved</button>
                  )}
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
        </div>
      </div>
    );
  }

  // WhatsApp-like chat interface (default)
  const isEmployee = role === 'employee';
  console.log('DEBUG: Rendering chat interface, ticket:', ticket, 'messages:', ticket?.messages?.length);
  return (
    <div className={`h-screen flex flex-col ${isEmployee ? 'bg-gray-50' : 'bg-blue-50'}`}>
      {/* Header */}
      <div className={`${isEmployee ? 'bg-white' : 'bg-blue-600'} shadow-sm border-b`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className={`text-lg font-semibold ${isEmployee ? 'text-gray-900' : 'text-white'}`}>{ticket.title}</h1>
                <p className={`text-sm ${isEmployee ? 'text-gray-500' : 'text-blue-100'}`}>
                  {ticket.assignedTo?.name || 'Unassigned'} • {ticket.status}
                  {ticket.status === 'resolved' && <span className="text-green-400 ml-1">✓</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification settings */}
              {'Notification' in window && (
                <div className="relative">
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      notificationSettings.desktopNotifications === 'granted'
                        ? 'text-green-600 hover:bg-green-100'
                        : notificationSettings.desktopNotifications === 'denied'
                        ? 'text-red-600 hover:bg-red-100'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                    title="Notification settings"
                  >
                    {notificationSettings.soundEnabled ? '🔔' : '🔕'}
                  </button>

                  {/* Notification Settings Panel */}
                  {showNotificationSettings && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-10">
                      <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Desktop Notifications</span>
                          <button
                            onClick={() => {
                              if (Notification.permission === 'default') {
                                Notification.requestPermission().then(permission => {
                                  setNotificationSettings(prev => ({ ...prev, desktopNotifications: permission }));
                                });
                              }
                            }}
                            className={`px-3 py-1 text-xs rounded-full ${
                              Notification.permission === 'granted'
                                ? 'bg-green-100 text-green-800'
                                : Notification.permission === 'denied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {Notification.permission === 'granted' ? 'Enabled' :
                             Notification.permission === 'denied' ? 'Blocked' : 'Request'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Sound Alerts</span>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notificationSettings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Vibration</span>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notificationSettings.vibrationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowNotificationSettings(false)}
                        className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowVideoCall(true)}
                title="Start audio call"
              >
                📞
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowVideoCall(true)}
                title="Start video call"
              >
                📹
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Ticket Info Banner */}
          <div className={`${isEmployee ? 'bg-blue-50 border-b' : 'bg-blue-100 border-b'} px-4 py-2`}>
            <div className={`text-sm ${isEmployee ? 'text-blue-800' : 'text-blue-900'}`}>
              <strong>Issue:</strong> {ticket.description}
            </div>
            <div className={`text-xs ${isEmployee ? 'text-blue-600' : 'text-blue-700'} mt-1`}>
              Created {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Initial chat history */}
            {ticket.chatHistory && ticket.chatHistory.length > 0 && ticket.chatHistory.map((m, i) => (
              <div key={`h-${i}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                }`}>
                  <div className="text-sm">{m.text}</div>
                  <div className={`text-xs mt-1 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(m.at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Live messages */}
            {filteredMessages && filteredMessages.length > 0 ? (
              filteredMessages.map((m, i) => {
                const isFromCurrentUser = m.from && m.from._id === ticket.createdBy?._id;
                return (
                  <div key={`m-${i}`} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isFromCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                    }`}>
                      <div className="text-sm font-medium text-xs mb-1 opacity-75">
                        {m.from?.name || 'IT Support'}
                      </div>
                      <div className="text-sm">{m.text}</div>

                      {/* Attachments */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {m.attachments.map((att, attIdx) => (
                            <div key={attIdx} className="flex items-center gap-2 bg-black bg-opacity-10 rounded p-2">
                              <span className="text-xs">📎</span>
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${att.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs hover:underline ${
                                  isFromCurrentUser ? 'text-blue-100' : 'text-blue-600'
                                }`}
                              >
                                {att.originalName}
                              </a>
                              <span className={`text-xs ${isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                ({(att.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`text-xs mt-1 flex items-center gap-1 ${
                        isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{new Date(m.at).toLocaleString()}</span>
                        {isFromCurrentUser && (
                          <span className={m.readBy && m.readBy.length > 0 ? 'text-blue-200' : 'text-blue-100'}>
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : null}

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Array.from(typingUsers).length === 1 ? 'typing...' : 'multiple people typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {(!ticket.chatHistory || ticket.chatHistory.length === 0) &&
             (!filteredMessages || filteredMessages.length === 0) && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💬</div>
                <div className="text-gray-500">
                  {searchTerm ? 'No messages match your search.' : 'Start the conversation!'}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className={`border-t ${isEmployee ? 'bg-white' : 'bg-blue-50'} px-4 py-3`}>
            <div className="flex items-end gap-3">
              {/* File attachment button */}
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  console.log('Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
                  setSelectedFiles(files);
                }}
                className="hidden"
                id="file-upload"
                accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${
                  selectedFiles.length > 0 ? 'bg-green-100' : ''
                }`}
                title="Attach files"
              >
                📎
              </label>

              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  showEmojis ? 'bg-blue-100' : ''
                }`}
                title="Emoji picker"
              >
                😀
              </button>

              {/* Message input */}
              <div className="flex-1 relative">
                <input
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Trigger send
                      document.getElementById('send-button')?.click();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Send button */}
              <button
                id="send-button"
                className={`p-2 rounded-full transition-colors ${
                  messageText.trim() || selectedFiles.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!messageText.trim() && selectedFiles.length === 0}
                onClick={async ()=>{
                  if (!messageText.trim() && selectedFiles.length === 0) return;
                  console.log('Sending message:', { text: messageText.trim(), files: selectedFiles.length });
                  try {
                    const formData = new FormData();
                    if (messageText.trim()) {
                      formData.append('text', messageText.trim());
                    }
                    selectedFiles.forEach((file, index) => {
                      console.log('Adding file:', file.name, file.size);
                      formData.append('attachments', file);
                    });

                    const response = await axios.post(`/tickets/${id}/messages`, formData);
                    console.log('Message sent successfully:', response.data);
                    setMessageText('');
                    setSelectedFiles([]);
                    setShowEmojis(false);
                    // Reset file input
                    const fileInput = document.getElementById('file-upload');
                    if (fileInput) fileInput.value = '';
                    // Stop typing indicator
                    if (socketRef.current) {
                      socketRef.current.emit('typing', { ticketId: id, userId, isTyping: false });
                    }
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    fetchTicket();
                  } catch (err) {
                    console.error('Failed to send message:', err);
                    alert(err.response?.data?.message || 'Failed to send message');
                  }
                }}
              >
                ➤
              </button>
            </div>
            {/* Emoji Picker */}
            {showEmojis && (
              <div className="absolute bottom-full mb-2 p-3 bg-white border rounded-lg shadow-lg">
                <div className="text-sm font-medium mb-2 text-gray-700">Choose an emoji:</div>
                <div className="grid grid-cols-6 gap-2">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageText(currentText => currentText + emoji);
                        setShowEmojis(false);
                      }}
                      className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Attachments Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">📎 Files to send:</div>
                <div className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-center gap-2 bg-white p-2 rounded">
                      <span>📄</span>
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== idx);
                          setSelectedFiles(newFiles);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {messageText && getSuggestions(messageText).length > 0 && (
              <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">💡 Suggestions:</div>
                <div className="flex flex-wrap gap-1">
                  {getSuggestions(messageText).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessageText(currentText => currentText + ' ' + suggestion)}
                      className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket Actions Footer */}
          <div className={`${isEmployee ? 'bg-white' : 'bg-blue-100'} border-t px-4 py-3`}>
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <div>Status: <span className={`font-medium ${
                  ticket.status === 'resolved' ? 'text-green-600' :
                  ticket.status === 'in_progress' ? 'text-blue-600' : 'text-orange-600'
                }`}>{ticket.status}</span></div>
                <div className="text-xs mt-1">
                  Employee: {ticket.resolvedByUser ? '✅ Confirmed' : '❌ Pending'} •
                  IT: {ticket.resolvedByIT ? '✅ Confirmed' : '❌ Pending'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {((role === 'employee' && !ticket.resolvedByUser) ||
                  (role === 'it_support' && !ticket.resolvedByIT)) &&
                 ticket.status !== 'resolved' && (
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={handleConfirm}
                  >
                    ✓ Confirm Resolved
                  </button>
                )}

                {role === 'it_support' && ticket.assignedTo && ticket.status !== 'resolved' && !ticket.resolvedByUser && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={async () => {
                      try {
                        await axios.post(`/tickets/${id}/request-confirmation`);
                        alert('Confirmation request sent to employee');
                        fetchTicket();
                      } catch (err) {
                        alert('Failed to send confirmation request');
                      }
                    }}
                  >
                    📞 Request Confirmation
                  </button>
                )}
              </div>
            </div>
          </div>

          <ConfirmModal
            show={showConfirmModal}
            title="Confirm Resolution"
            value={resolutionSummary}
            onChange={setResolutionSummary}
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={doConfirm}
            confirmLabel="Confirm Resolution"
            showResolutionTypes={true}
            role={role}
          />

          {/* Video Call Modal */}
          <VideoCallModal
            isOpen={showVideoCall}
            onClose={() => setShowVideoCall(false)}
            ticketId={id}
            remoteUser={role === 'employee' ? ticket.assignedTo?.name : ticket.createdBy?.name}
            socket={socketRef.current}
          />
        </div>
      </div>
    </div>
  );
}
