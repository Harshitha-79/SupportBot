import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import StatsChart from '../components/StatsChart';

export default function Admin() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [itStaffData, setItStaffData] = useState({ total: 0, active: 0, users: [] });
  const [applying, setApplying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [hours, setHours] = useState({ start: '09:00', end: '17:00', breaks: [] });
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [adminMessages, setAdminMessages] = useState([]);
  const [itMessages, setItMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', message: '' });

  // Fetch all admin data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, pendingRes, itUsersRes, attendanceRes, messagesRes] = await Promise.all([
        axios.get('/admin/unassigned').catch(() => ({ data: [] })),
        axios.get('/admin/users/pending').catch(() => ({ data: [] })),
        axios.get('/admin/users').catch(() => ({ data: { total: 0, active: 0, users: [] } })),
        axios.get(`/admin/attendance?month=${selectedMonth}&year=${selectedYear}`).catch(() => ({ data: [] })),
        axios.get('/admin/messages').catch(() => ({ data: [] }))
      ]);

      setTickets(ticketsRes.data);
      setPendingUsers(pendingRes.data);
      setItStaffData(itUsersRes.data);
      setAttendanceData(attendanceRes.data);
      setAdminMessages(messagesRes.data);
    } catch (e) {
      if (e.response?.status === 401) {
        alert('Session expired. Please login again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`/admin/attendance?month=${selectedMonth}&year=${selectedYear}`);
      setAttendanceData(res.data);
    } catch (e) {
      console.error('Failed to fetch attendance:', e);
    }
  };

  // Fetch admin messages
  const fetchMessages = async () => {
    try {
      const [adminMsgs, itMsgs] = await Promise.all([
        axios.get('/admin/messages'),
        axios.get('/admin/messages/it')
      ]);
      setAdminMessages(adminMsgs.data);
      setItMessages(itMsgs.data);
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAttendance();
    fetchMessages();
    // Auto-refresh every 30 seconds to show online status
    const interval = setInterval(() => {
      fetchAllData();
      fetchAttendance();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  // Auto-assign tickets
  const applyAll = async () => {
    if (!confirm('Assign all tickets to least-loaded IT staff?')) return;
    try {
      setApplying(true);
      await axios.post('/admin/assign');
      alert('Tickets assigned successfully');
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to assign tickets');
    } finally {
      setApplying(false);
    }
  };

  // Create new IT user
  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      return alert('Please provide name, email, and password');
    }
    try {
      setCreating(true);
      const payload = { ...newUser, workingHours: hours };
      await axios.post('/admin/users', payload);
      alert('IT user created successfully');
      setNewUser({ name: '', email: '', password: '' });
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // Approve pending IT user
  const approveUser = async (id) => {
    if (!confirm('Approve this IT user?')) return;
    try {
      await axios.post(`/admin/users/${id}/approve`);
      alert('User approved successfully');
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to approve user');
    }
  };

  // Remove IT user
  const removeUser = async (id) => {
    if (!confirm('Remove this user from IT staff?')) return;
    try {
      await axios.post(`/admin/users/${id}/remove`);
      alert('User removed successfully');
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to remove user');
    }
  };

  // Update working hours
  const updateWorkingHours = async (id, currentHours) => {
    const start = prompt('Enter start time (HH:MM)', currentHours.start);
    if (!start) return;
    const end = prompt('Enter end time (HH:MM)', currentHours.end);
    if (!end) return;

    try {
      await axios.put(`/admin/users/${id}/working-hours`, { workingHours: { start, end } });
      alert('Working hours updated');
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update hours');
    }
  };

  // Send message to IT staff
  const sendMessage = async () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.message) {
      return alert('Please fill all fields');
    }
    try {
      await axios.post('/admin/messages', newMessage);
      alert('Message sent successfully');
      setNewMessage({ to: '', subject: '', message: '' });
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send message');
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`/admin/attendance?month=${selectedMonth}&year=${selectedYear}`);
        setAttendanceData(res.data);
      } catch (e) {
        console.error('Failed to fetch attendance:', e);
      }
    };
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container-page py-8 max-w-6xl">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="muted text-sm">Manage IT staff and ticket assignments</p>
          </div>
          <button className="btn-ghost" onClick={fetchAllData}>Refresh</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Create IT User */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Create IT Support Staff</h2>
              <input
                className="input mb-3"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                className="input mb-3"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                className="input mb-3"
                placeholder="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />

              <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-3">Working Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm muted block mb-1">Start Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={hours.start}
                      onChange={(e) => setHours({ ...hours, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm muted block mb-1">End Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={hours.end}
                      onChange={(e) => setHours({ ...hours, end: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full" onClick={createUser} disabled={creating}>
                {creating ? 'Creating...' : 'Create IT Staff'}
              </button>
            </div>
          </div>

          {/* Ticket Management */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">Unassigned Tickets</h2>
                <button
                  className="btn-primary w-full mb-3"
                  onClick={applyAll}
                  disabled={applying || tickets.length === 0}
                >
                  {applying ? 'Assigning...' : `Auto-Assign ${tickets.length} Tickets`}
                </button>
                <p className="text-sm text-slate-600">
                  Assigns tickets to least-loaded IT staff
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3">
                  <a href="/kb" className="btn-secondary">Manage Knowledge Base</a>
                  <a href="/kb/pending" className="btn-secondary">Review Pending KB</a>
                  <a href="/tickets" className="btn-secondary">View All Tickets</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IT Staff List */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">IT Support Staff ({itStaffData.total})</h2>
              <span className="text-sm text-slate-600">
                {itStaffData.active} Active
              </span>
            </div>

            {itStaffData.users.length === 0 ? (
              <div className="text-center py-4 text-slate-500">No IT staff found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Working Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Workload</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-right text-xs font-medium muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                    {itStaffData.users.map(staff => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              staff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              staff.isOnline ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {staff.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="text-sm">
                              {staff.workingHours?.start || '09:00'} - {staff.workingHours?.end || '17:00'}
                            </div>
                            <button
                              onClick={() => updateWorkingHours(staff.id, staff.workingHours || { start: '09:00', end: '17:00' })}
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{staff.stats.openTickets} Open</div>
                          <div className="text-xs text-gray-500">{staff.stats.totalTickets} Total</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{staff.stats.resolutionRate}% Resolution</div>
                          <div className="text-xs text-gray-500">~{staff.stats.avgResolutionTime} min avg</div>
                          <div className="text-xs text-gray-600 mt-1">{staff.stats.efficiencyStatement}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {staff.isActive ? (
                            <button
                              onClick={() => removeUser(staff.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => approveUser(staff.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Pending IT Approvals</h2>
              <div className="grid gap-3">
                {pendingUsers.map(u => (
                  <div key={u._id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{u.name || u.email}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <button className="btn-primary" onClick={() => approveUser(u._id)}>Approve</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tracking */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">IT Staff Attendance Report</h2>
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {attendanceData.length === 0 ? (
              <div className="text-center py-4 text-slate-500">No attendance data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Total Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Working Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Avg Hours/Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                    {attendanceData.map(staff => (
                      <tr key={staff.userId}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{staff.totalHours}h</td>
                        <td className="px-6 py-4 text-sm">{staff.totalDays} days</td>
                        <td className="px-6 py-4 text-sm">{staff.avgHoursPerDay}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Admin-IT Messaging */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Send Message */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Send Message to IT Staff</h2>
              <select
                value={newMessage.to}
                onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                className="input mb-3"
              >
                <option value="">Select IT Staff Member</option>
                {itStaffData.users?.filter(u => u.isActive).map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
              <input
                className="input mb-3"
                placeholder="Subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
              <textarea
                className="textarea mb-3"
                placeholder="Message"
                rows="4"
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
              />
              <button className="btn-primary w-full" onClick={sendMessage}>
                Send Message
              </button>
            </div>
          </div>

          {/* Message History */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Message History</h2>
              {adminMessages.length === 0 ? (
                <div className="text-center py-4 text-slate-500">No messages sent</div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {adminMessages.map(msg => (
                    <div key={msg._id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{msg.subject}</div>
                        <div className="text-xs text-slate-500">
                          To: {msg.to?.name || 'Unknown'}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{msg.message}</p>
                      <div className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unassigned Tickets List */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Unassigned Resolved Tickets</h2>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No unassigned tickets</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tickets.map(t => (
                  <div key={t._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{t.title}</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Unassigned</span>
                    </div>
                    <p className="text-slate-600 mb-3">{t.description}</p>
                    <div className="flex justify-between text-xs text-slate-500">
                      <p>Created by: {t.createdBy?.name || 'Unknown'}</p>
                      <p>ID: {t._id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


