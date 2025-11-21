import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import ITDashboard from "./pages/ITDashboard";
import TicketDetail from "./pages/TicketDetail";
import Admin from "./pages/Admin";
import ITStaffStats from "./pages/ITStaffStats";
import Chatbot from "./pages/Chatbot";
import KnowledgeBase from "./pages/KnowledgeBase";
import KbCuration from "./pages/KbCuration";
import ChangePassword from "./pages/ChangePassword";

export default function App() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  // Redirect to appropriate homepage based on role
  const getHomePage = () => {
    if (!token) return "/login";
    switch (role) {
      case "admin": return "/admin";
      case "it_support": return "/dashboard";
      case "employee": return "/dashboard";
      default: return "/dashboard";
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? getHomePage() : "/login"} />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to={getHomePage()} />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to={getHomePage()} />} />
        
        {token && (
          <>
            {/* Admin routes */}
            <Route path="/admin" element={role === "admin" ? <Admin /> : <Navigate to={getHomePage()} />} />
            <Route path="/kb" element={role === "admin" || role === "it_support" ? <KnowledgeBase /> : <Navigate to={getHomePage()} />} />
            <Route path="/kb/pending" element={role === "admin" || role === "it_support" ? <KbCuration /> : <Navigate to={getHomePage()} />} />

            {/* Shared dashboard for employees and IT staff */}
            <Route path="/dashboard" element={role === "employee" || role === "it_support" ? <Dashboard /> : <Navigate to={getHomePage()} />} />

            {/* IT Support routes */}
            <Route path="/it" element={role === "it_support" ? <ITDashboard /> : <Navigate to={getHomePage()} />} />
            <Route path="/it/tickets/:id" element={role === "it_support" ? <TicketDetail /> : <Navigate to={getHomePage()} />} />
            <Route path="/it/stats" element={role === "it_support" || role === "admin" ? <ITStaffStats /> : <Navigate to={getHomePage()} />} />

            {/* Employee routes */}
            <Route path="/tickets" element={role === "employee" || role === "admin" ? <Tickets /> : <Navigate to={getHomePage()} />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/chat" element={role === "employee" ? <Chatbot /> : <Navigate to={getHomePage()} />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={getHomePage()} />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
