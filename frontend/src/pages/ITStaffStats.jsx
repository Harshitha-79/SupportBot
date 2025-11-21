import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';

export default function ITStaffStats() {
   const [stats, setStats] = useState(null);
   const [attendance, setAttendance] = useState([]);
   const [allStats, setAllStats] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const role = sessionStorage.getItem("role");

   useEffect(() => {
     fetchStats();
   }, []);

   const fetchStats = async () => {
     try {
       setLoading(true);
       if (role === 'admin') {
         // For admin, fetch all IT staff stats
         const allStatsRes = await axios.get('/it/all-stats');
         setAllStats(allStatsRes.data);
       } else {
         // For IT staff, fetch own stats
         const [statsRes, attendanceRes] = await Promise.all([
           axios.get('/it/stats'),
           axios.get('/it/attendance')
         ]);
         setStats(statsRes.data);
         setAttendance(attendanceRes.data);
       }
     } catch (e) {
       setError(e.response?.data?.message || 'Failed to load stats');
     } finally {
       setLoading(false);
     }
   };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container-page py-8 max-w-6xl">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading your stats...</p>
          </div>
 
          {/* Admin view: All IT Staff Stats */}
          {role === 'admin' && allStats.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">Individual IT Staff Performance</h2>
              <div className="grid gap-6">
                {allStats.map((staff) => (
                  <div key={staff.id} className="card">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{staff.name}</h3>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          staff.currentStatus === 'online' ? 'bg-green-100 text-green-800' :
                          staff.currentStatus === 'away' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staff.currentStatus}
                        </span>
                      </div>
 
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{staff.totalTickets}</div>
                          <div className="text-sm text-gray-600">Total Tickets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{staff.resolvedTickets}</div>
                          <div className="text-sm text-gray-600">Resolved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{staff.openTickets}</div>
                          <div className="text-sm text-gray-600">Open</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{staff.resolutionRate}%</div>
                          <div className="text-sm text-gray-600">Resolution Rate</div>
                        </div>
                      </div>
 
                      <div className="text-sm text-gray-600 mb-4">
                        <span>Avg. Resolution Time: {staff.avgResolutionTime} min</span>
                        {staff.lastActive && (
                          <span className="ml-4">Last Active: {new Date(staff.lastActive).toLocaleString()}</span>
                        )}
                      </div>
 
                      {staff.recentAttendance.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Recent Attendance</h4>
                          <div className="text-sm space-y-1">
                            {staff.recentAttendance.slice(0, 5).map((record, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{new Date(record.date).toLocaleDateString()}</span>
                                <span>{record.workDuration ? `${record.workDuration} min` : 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container-page py-8 max-w-6xl">
          <div className="text-center py-8 text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {role === 'admin' ? 'IT Staff Performance Overview' : 'My Performance Stats'}
          </h1>
          <button className="btn-ghost" onClick={fetchStats}>Refresh Stats</button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Tickets Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Tickets:</span>
                  <span className="font-medium">{stats?.totalTickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Resolved:</span>
                  <span className="font-medium">{stats?.resolvedTickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Open:</span>
                  <span className="font-medium">{stats?.openTickets || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Resolution Rate:</span>
                  <span className="font-medium">{stats?.resolutionRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg. Resolution Time:</span>
                  <span className="font-medium">{stats?.avgResolutionTime || 0} min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Working Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Schedule:</span>
                  <span className="font-medium">
                    {stats?.workingHours?.start || '09:00'} - {stats?.workingHours?.end || '17:00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-medium ${
                    stats?.currentStatus === 'online' ? 'text-green-600' :
                    stats?.currentStatus === 'away' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {stats?.currentStatus || 'offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card mb-8">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Logout Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Work Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium muted uppercase tracking-wider">Tickets Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                  {attendance.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(record.loginTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.workDuration ? `${Math.round(record.workDuration)} min` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.ticketsResolved}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}