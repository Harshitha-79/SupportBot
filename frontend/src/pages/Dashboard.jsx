import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, FileText, Database, BarChart } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        {/* Main Content */}
        <div className="card p-10 text-center max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to <span className="text-purple-300">IT Support AI</span>
          </h1>
          <p className="muted mb-8">
            {role === "employee"
              ? "Create or track your IT support tickets easily, or chat with our AI assistant for instant help."
              : "Manage assigned tickets, curate knowledge base, and view your performance stats."
            }
          </p>

          {/* Action Buttons - Role-Specific */}
          <div className="flex justify-center gap-4 flex-wrap">
            {role === "employee" ? (
              <>
                <button
                  onClick={() => navigate("/tickets")}
                  className="flex items-center gap-2 btn-primary"
                >
                  <FileText size={18} />
                  Go to Tickets
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center gap-2 btn-primary"
                >
                  <MessageCircle size={18} />
                  Chat with AI
                </button>
              </>
            ) : role === "it_support" ? (
              <>
                <button
                  onClick={() => navigate("/it")}
                  className="flex items-center gap-2 btn-primary"
                >
                  <FileText size={18} />
                  Assigned Tickets
                </button>
                <button
                  onClick={() => navigate("/kb")}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Database size={18} />
                  Knowledge Base
                </button>
                <button
                  onClick={() => navigate("/it/stats")}
                  className="flex items-center gap-2 btn-primary"
                >
                  <BarChart size={18} />
                  My Stats
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-8 pb-8">
          © {new Date().getFullYear()} IT Support AI. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
