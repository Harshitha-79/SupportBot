import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingClarify, setAwaitingClarify] = useState(false);
  const [clarifyAttempts, setClarifyAttempts] = useState(0);
  const [escalatedCreateContext, setEscalatedCreateContext] = useState(null);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  // Common emojis for IT support conversations
  const commonEmojis = ['😊', '👍', '👎', '✅', '❌', '🚀', '💻', '📱', '🔧', '📎', '📁', '📄', '🤔', '💡', '⚡', '🔍'];

  // AI suggestions based on user input
  const getAISuggestions = (text) => {
    const lowerText = text.toLowerCase();
    const suggestions = [];

    if (lowerText.includes('password')) {
      suggestions.push('Try resetting your password through the login page');
      suggestions.push('Check if Caps Lock is on');
    }
    if (lowerText.includes('vpn')) {
      suggestions.push('Ensure your VPN credentials are correct');
      suggestions.push('Try restarting your VPN client');
    }
    if (lowerText.includes('slow') || lowerText.includes('lag')) {
      suggestions.push('Close unnecessary applications');
      suggestions.push('Check your internet connection speed');
    }
    if (lowerText.includes('error') || lowerText.includes('crash')) {
      suggestions.push('Note the exact error message');
      suggestions.push('Try restarting the application');
    }
    if (lowerText.includes('login') || lowerText.includes('sign in')) {
      suggestions.push('Verify your username and password');
      suggestions.push('Try clearing browser cache');
    }
    if (lowerText.includes('email') || lowerText.includes('outlook')) {
      suggestions.push('Check your email server settings');
      suggestions.push('Try accessing email via web interface');
    }

    return suggestions.slice(0, 2); // Max 2 suggestions
  };

  // Witty responses for non-technical chit-chat
  const wittyResponses = [
    "I'm more of a tech whisperer than a conversationalist — but I'm all ears for your IT troubles!",
    "My small talk algorithm needs updating, but my troubleshooting skills are razor-sharp! Tell me about your tech issue.",
    "If this were about quantum computing, I'd be lost too! Let's stick to IT support — what's the tech trouble?",
    "I'm better at fixing printers than making jokes. Speaking of printers... having any issues?",
    "My human colleagues handle the coffee breaks — I'm here for the technical stuff! What can I help debug?",
    "GPUs? More like GP-Who? I'm your IT support bot! Let me know if you have any technical problems.",
    "I'd love to chat about the weather, but I'm more qualified to help with your computer weather... I mean, technical issues!"
  ];
  
  const getWittyResponse = () => wittyResponses[Math.floor(Math.random() * wittyResponses.length)];

  // Format bot messages with basic markdown support
  const formatBotMessage = (text) => {
    // Handle bold text (**text**)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Remove remaining single asterisks
    formatted = formatted.replace(/\*/g, '');
    return formatted;
  };

  // Lightweight heuristic: only treat messages as 'technical' when they contain common IT keywords
  const technicalKeywords = [
    'vpn', 'printer', 'laptop', 'wifi', 'network', 'internet', 'email', 'outlook', 'battery', 'noise', 'slow', 'crash', 'hang', 'error', 'failed', 'install', 'update', 'driver', 'blue screen', 'bsod'
  ];

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/auth/profile/${userId}`);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    // Setup Web Speech Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => transcript);
        // optionally auto-send
        handleSendSpeech(transcript);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      console.error('Failed to start recognition', e);
    }
  };


  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setListening(false);
    } catch (e) {
      console.error('Failed to stop recognition', e);
    }
  };

  const handleSendSpeech = async (transcript) => {
    // send transcript as if user entered and submitted
    if (!transcript || !transcript.trim()) return;
    const newMsg = { role: 'user', text: transcript };
  setMessages((prev) => [...prev, { ...newMsg, timestamp: new Date().toISOString() }]);
    setLoading(true);
    setInput('');
    // If we were awaiting a clarification, check whether the transcript provides more detail
    if (awaitingClarify) {
      const lc = transcript.trim().toLowerCase();
      const isTechnical = technicalKeywords.some((k) => lc.includes(k));
      if (!isTechnical) {
        setMessages((prev) => [...prev, { role: 'bot', text: getWittyResponse(), timestamp: new Date().toISOString() }]);
        setLoading(false);
        return;
      }

      const wcount = transcript.trim().split(/\s+/).filter(Boolean).length;
      if (wcount <= 3) {
        const attempts = clarifyAttempts + 1;
        setClarifyAttempts(attempts);
        if (attempts >= 2) {
          // Escalate to professional decorum message and store context for quick ticket creation
          const esc = "Please be professional and provide a clear one-line summary. If you don't have an issue, you may return to work. If you need help, reply with 'create ticket' and I'll file one for you.";
          setMessages((prev) => [...prev, { role: 'bot', text: esc }]);
          setEscalatedCreateContext(transcript || newMsg?.text || '');
          setAwaitingClarify(false);
          setClarifyAttempts(0);
          setLoading(false);
          return;
        }
        // Ask clarifying sentence again (gentle nudge)
        const clarifying = "Could you please provide a one-line summary of the issue and whether it's urgent? If it's urgent I will create a ticket right away.";
        setMessages((prev) => [...prev, { role: 'bot', text: clarifying }]);
        setLoading(false);
        return;
      }
      // otherwise proceed to backend
      setAwaitingClarify(false);
      setClarifyAttempts(0);
    }

    try {
      const res = await axios.post('/chat/ask', { query: transcript, messages: [...messages, newMsg] });
      console.log('DEBUG: Chat response:', res.data);
      const reply = res.data.reply || res.data.answer || 'No response.';

      // detect clarifying reply from server and set awaiting state
      const clarifying = "Could you please provide a one-line summary of the issue and whether it's urgent? If it's urgent I will create a ticket right away.";
      if (reply === clarifying) {
        setAwaitingClarify(true);
        setClarifyAttempts(0);
      }

      // If server directly created a ticket and returned its info, clear any escalated context
      if (res.data?.ticketCreated) {
        setEscalatedCreateContext(null);
        setCreatedTicketId(res.data.ticket?.id);
      }

      // Handle ticket suggestion from backend
      if (res.data.ticketSuggested) {
        console.log('DEBUG: Ticket suggested by backend:', res.data.suggested);
        setEscalatedCreateContext(res.data.suggested?.description || reply);
      }

  setMessages((prev) => [...prev, { role: 'bot', text: reply, timestamp: new Date().toISOString() }]);
      if (voiceEnabled) speakText(reply);
    } catch (err) {
      console.error('Chatbot error:', err.message);
      let errorMessage = "⚠️ Error contacting server. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "⚠️ Session expired. Please refresh the page or re-login to continue.";
      } else if (err.response?.status === 403) {
        errorMessage = "⚠️ Access denied. Please check your permissions.";
      } else if (!err.response) {
        errorMessage = "⚠️ Network error. Please check your connection.";
      }

      setMessages((prev) => [...prev, {
        role: 'bot',
        text: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const cleanTextForSpeech = (text) => {
    // Remove emojis, asterisks, and special characters that TTS might not handle well
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/\*/g, '').replace(/[^\w\s.,!?-]/g, '').trim();
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return; // Don't speak if text is empty after cleaning
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'en-US';
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = (e) => {
        console.error('TTS error', e);
        setSpeaking(false);
      };
      // optional voice selection
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // prefer a female / neutral voice if available
        const v = voices.find(v => /female|woman|alloy/i.test(v.name)) || voices[0];
        utter.voice = v;
      }
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error('speakText failed', e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    // prepare messages to send (include previous conversation + current message)
    const messagesToSend = [...messages, newMsg];
  setMessages((prev) => [...prev, { ...newMsg, timestamp: new Date().toISOString() }]);
    setInput("");
    setLoading(true);
    // If awaiting clarification from earlier, enforce escalation policy client-side
    if (awaitingClarify) {
      const lc = input.trim().toLowerCase();
      const isTechnical = technicalKeywords.some((k) => lc.includes(k));
      if (!isTechnical) {
        setMessages((prev) => [...prev, { role: 'bot', text: getWittyResponse(), timestamp: new Date().toISOString() }]);
        setLoading(false);
        return;
      }

      const wcount = input.trim().split(/\s+/).filter(Boolean).length;
      if (wcount <= 3) {
        const attempts = clarifyAttempts + 1;
        setClarifyAttempts(attempts);
        if (attempts >= 2) {
          const esc = "Please be professional and provide a clear one-line summary. If you don't have an issue, you may return to work. If you need help, reply with 'create ticket' and I'll file one for you.";
          setMessages((prev) => [...prev, { role: 'bot', text: esc }]);
          // store context for potential ticket creation
          setEscalatedCreateContext(input);
          setAwaitingClarify(false);
          setClarifyAttempts(0);
          setLoading(false);
          return;
        }
        const clarifying = "Could you please provide a one-line summary of the issue and whether it's urgent? If it's urgent I will create a ticket right away.";
        setMessages((prev) => [...prev, { role: 'bot', text: clarifying }]);
        setLoading(false);
        return;
      }
      // otherwise proceed to send to backend
      setAwaitingClarify(false);
      setClarifyAttempts(0);
    }

    // If user confirms ticket creation with yes/sure/okay etc. after escalation, create ticket automatically
    const normalized = input.trim().toLowerCase();
    const confirmationKeywords = ['yes', 'sure', 'okay', 'ok', 'please', 'go ahead', 'do it', 'confirm', 'proceed', 'yep', 'yeah', 'alright', 'fine', 'right', 'absolutely', 'definitely'];
    console.log('DEBUG: Checking confirmation - escalatedCreateContext:', escalatedCreateContext, 'input:', normalized);
    if (escalatedCreateContext && confirmationKeywords.some(keyword => normalized.includes(keyword))) {
      console.log('DEBUG: Confirmation detected, creating ticket');
      try {
        const problem = escalatedCreateContext || input;
        const title = problem.length > 100 ? problem.substring(0, 97) + '...' : problem;
        const description = problem;
        const res = await axios.post('/tickets', { title, description, chatHistory: messagesToSend });
        const ticket = res.data;
  const assignedLabel = ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.email || 'IT team') : 'IT team';
  setMessages((prev) => [...prev, { role: 'bot', text: `Ticket created (ID: ${ticket._id}). Assigned: ${assignedLabel}.`, timestamp: new Date().toISOString() }]);
        setEscalatedCreateContext(null);
        setCreatedTicketId(ticket._id);
      } catch (err) {
        console.error('Ticket create failed:', err);
        setMessages((prev) => [...prev, { role: 'bot', text: `Failed to create ticket automatically. Please try via the Tickets page or contact IT.` }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // If user explicitly types "create ticket" (or starts with it) after escalation, create ticket automatically
    if ((normalized === 'create ticket' || normalized.startsWith('create ticket')) && escalatedCreateContext) {
      try {
        const providedDetail = input.trim().length > 12 ? input.trim().slice(12).trim() : null; // capture anything after 'create ticket'
        const problem = providedDetail || escalatedCreateContext || input;
        const title = problem.length > 100 ? problem.substring(0, 97) + '...' : problem;
        const description = problem;
        const res = await axios.post('/tickets', { title, description, chatHistory: messagesToSend });
        const ticket = res.data;
  const assignedLabel = ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.email || 'IT team') : 'IT team';
  setMessages((prev) => [...prev, { role: 'bot', text: `Ticket created (ID: ${ticket._id}). Assigned: ${assignedLabel}.`, timestamp: new Date().toISOString() }]);
        setEscalatedCreateContext(null);
        setCreatedTicketId(ticket._id); // Show chat button
        setCreatedTicketId(ticket._id); // Show chat button
      } catch (err) {
        console.error('Ticket create failed:', err);
        setMessages((prev) => [...prev, { role: 'bot', text: `Failed to create ticket automatically. Please try via the Tickets page or contact IT.` }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // send query and conversation history so server can create richer tickets when needed
      const res = await axios.post("/chat/ask", { query: input, messages: messagesToSend });
      console.log('DEBUG: Chat response:', res.data);
      const reply = res.data.reply
        ? res.data.reply
        : res.data.answer || "No response received.";

      // detect clarifying sentence and set awaiting state
      const clarifying = "Could you please provide a one-line summary of the issue and whether it's urgent? If it's urgent I will create a ticket right away.";
      if (reply === clarifying) {
        setAwaitingClarify(true);
        setClarifyAttempts(0);
      }

      // Handle ticket suggestion from backend - set context for automatic creation on confirmation
      if (res.data.ticketSuggested) {
        console.log('DEBUG: Ticket suggested by backend:', res.data.suggested);
        setEscalatedCreateContext(res.data.suggested?.description || input);
        // Don't show modal - wait for user confirmation
      }

      // Detect if backend reply contains ticket suggestion (fallback for when ticketSuggested flag is not set)
      if (reply.includes("Would you like me to create a support ticket") || reply.includes("Just reply")) {
        console.log('DEBUG: Detected ticket suggestion in reply, setting escalated context');
        setEscalatedCreateContext(input); // Use the original user input as context
      }

      // Check if ticket was created in this response
      if (res.data?.ticketCreated) {
        setCreatedTicketId(res.data.ticket?.id);
      }

  setMessages((prev) => [...prev, {
    role: "bot",
    text: reply,
    timestamp: new Date().toISOString(),
    priority: res.data?.priority || 'unknown',
    responseType: res.data?.responseType || 'unknown'
  }]);
      if (voiceEnabled) speakText(reply);
    } catch (err) {
      console.error("Chatbot error:", err.message);
      let errorMessage = "Error contacting server. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please refresh the page or re-login to continue.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: errorMessage,
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 pt-16">
        <div className="w-full max-w-2xl card p-4 sm:p-6">
         <h2 className="text-3xl font-bold text-center mb-2">
           AI Support Chatbot
         </h2>
         <p className="text-center muted mb-6">
           Ask me anything related to IT support or troubleshooting!
         </p>

        <div className="h-96 overflow-y-auto rounded-xl p-4 shadow-inner transition-all bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 italic mt-20">
              Start the conversation by typing below
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex mb-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-[rgba(255,255,255,0.03)] text-white rounded-bl-none whitespace-pre-wrap"
                }`}
              >
                {msg.role === "bot" ? (
                  <span dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.text) }} />
                ) : (
                  msg.text
                )}
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  {msg.role === "bot" && msg.priority && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      msg.priority === 'high' ? 'bg-red-500 text-white' :
                      msg.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      msg.priority === 'low' ? 'bg-green-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {msg.priority.toUpperCase()}
                    </span>
                  )}
                  {msg.role === "bot" && msg.responseType && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                      {msg.responseType === 'llm-generated' ? 'AI' :
                       msg.responseType === 'template-based' ? 'Template' : 'Other'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-center muted animate-pulse">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span>AI is thinking...</span>
            </div>
          )}

          {/* Auth Error Recovery */}
          {messages.some(msg => msg.text?.includes("Session expired")) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-yellow-800 mb-2">🔐 Your session has expired</div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary text-xs px-3 py-1"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Re-login
                </button>
              </div>
            </div>
          )}

            {/* If ticket was just created, show "Chat with IT" button */}
            {createdTicketId && (
              <div className="mt-3 w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-green-800 font-medium mb-2">Ticket Created Successfully!</div>
                  <div className="text-sm text-green-600 mb-3">Ready to chat with IT support?</div>
                  <button
                    className="btn-primary bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      // Store the ticket ID before clearing
                      const ticketId = createdTicketId;
                      setCreatedTicketId(null);
                      // Small delay to ensure state update
                      setTimeout(() => {
                        navigate(`/tickets/${ticketId}`);
                      }, 100);
                    }}
                  >
                    Chat with IT Staff Now
                  </button>
                </div>
              </div>
            )}
        </div>
        <form
          onSubmit={handleSend}
          className="flex flex-col gap-3 mt-5 pt-4"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 input"
            />
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className={`btn-ghost px-3 py-2 ${showEmojis ? 'bg-blue-100' : ''}`}
              title="Emoji picker"
            >
              Emojis
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="bg-white border rounded-lg shadow-md p-3">
              <div className="text-sm font-medium mb-2 text-gray-700">Choose an emoji:</div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInput(currentInput => currentInput + emoji);
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

          {/* AI Suggestions */}
          {input && getAISuggestions(input).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-800 mb-2">AI Suggestions:</div>
              {getAISuggestions(input).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(currentInput => currentInput + ' ' + suggestion)}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            {speechSupported ? (
              <button
                type="button"
                onClick={() => {
                  if (listening) stopListening(); else startListening();
                }}
                className={`btn ${listening ? 'bg-green-600' : 'btn-ghost'}`}
                aria-pressed={listening}
              >
                {listening ? 'Listening…' : 'Voice'}
              </button>
            ) : (
              <div className="muted text-sm">Voice N/A</div>
            )}

            <button
              type="submit"
              className="btn-primary px-5 py-2"
            >
              Send
            </button>
          </div>
        </form>



        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ghost"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <label className="text-sm muted">Voice replies</label>
            <input type="checkbox" checked={voiceEnabled} onChange={(e)=>setVoiceEnabled(e.target.checked)} />
            {speaking && <div className="text-sm muted">Speaking…</div>}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
