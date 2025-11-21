import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export default function Navbar() {
  const role = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const userEmail = sessionStorage.getItem("userEmail");
  const defaultPath = role === "admin" ? "/admin" : role === "it_support" ? "/it" : "/tickets";
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(userName ? { name: userName, email: userEmail, role } : null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          console.log('DEBUG: Fetching user profile for userId:', userId);
          const response = await axios.get(`/auth/profile/${userId}`);
          console.log('DEBUG: User profile response:', response.data);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          console.error('Error details:', error.response?.data || error.message);
        }
      } else {
        console.log('DEBUG: No userId found in sessionStorage');
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch unread message count for IT staff
  useEffect(() => {
    if (role === 'it_support' && userId) {
      const fetchUnreadCount = async () => {
        try {
          // Get assigned tickets and count unread messages
          const response = await axios.get('/tickets/assigned');
          const tickets = response.data;

          let totalUnread = 0;
          for (const ticket of tickets) {
            if (ticket.messages && ticket.messages.length > 0) {
              // Count messages from employees that are newer than IT's last response
              const employeeMessages = ticket.messages.filter(m =>
                m.from && m.from._id !== userId
              );

              if (employeeMessages.length > 0) {
                // Find IT's last response
                const itMessages = ticket.messages.filter(m =>
                  m.from && m.from._id === userId
                );

                const lastITResponse = itMessages.length > 0
                  ? new Date(Math.max(...itMessages.map(m => new Date(m.at))))
                  : new Date(0);

                // Count employee messages after last IT response
                const unreadInTicket = employeeMessages.filter(m =>
                  new Date(m.at) > lastITResponse
                ).length;

                totalUnread += unreadInTicket;
              }
            }
          }

          setUnreadCount(totalUnread);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      };

      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [role, userId]);


  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="flex items-center gap-4">
          <a href={defaultPath} className="brand">IT Support AI</a>
          {role === "admin" && (
            <>
              <a href="/admin" className="nav-link">Admin Dashboard</a>
              <a href="/kb" className="nav-link">Knowledge Base</a>
              <a href="/kb/pending" className="nav-link">KB Curation</a>
            </>
          )}
          {role === "it_support" && (
            <>
              <a href="/it" className="nav-link relative">
                IT Dashboard
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </a>
              <a href="/kb" className="nav-link">Knowledge Base</a>
              <a href="/kb/pending" className="nav-link">KB Curation</a>
            </>
          )}
          {role === "employee" && (
            <>
              <a href="/tickets" className="nav-link">My Tickets</a>
              <a href="/chat" className="nav-link">Chat Support</a>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Change Password Link */}
          <a
            href="/change-password"
            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </a>

          {/* User Info */}
          {userProfile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="font-medium text-gray-900">{userProfile.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                {userProfile.role.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Logout Button - Always Visible */}
          <button
            onClick={async () => {
              console.log('DEBUG: Logout clicked');
              try {
                const response = await axios.post('/auth/logout');
                console.log('DEBUG: Logout API successful:', response.data);
              } catch (error) {
                console.error('DEBUG: Logout API failed:', error.response?.status, error.response?.data || error.message);
                // Continue with client-side logout even if server call fails
              }

              sessionStorage.clear();
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
