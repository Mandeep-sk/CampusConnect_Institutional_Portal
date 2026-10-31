import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      toast.error('Could not load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApprove = async (eventId) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/events/${eventId}/approve`);
      if (res.data.success) {
        toast.success('Event approved and published!');
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating campus statistics..." />;
  }

  const stats = data?.stats || {};
  const pendingList = data?.pendingList || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 mb-2 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Administration Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Real-time overview of active student enrollments, faculty proposals, event approvals,
            and campus notice dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/approvals"
            className="px-4 py-2.5 bg-white text-blue-800 text-xs font-bold rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Review Approvals ({stats.pendingApprovals || 0})</span>
          </Link>
          <Link
            to="/admin/notices"
            className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Notice</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="emerald"
          subtitle="Enrolled learners"
        />
        <DashboardCard
          title="Total Faculty"
          value={stats.totalFaculty}
          icon={Users}
          color="blue"
          subtitle="Department mentors"
        />
        <DashboardCard
          title="Campus Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="indigo"
          subtitle={`${stats.approvedEvents || 0} approved & active`}
        />
        <DashboardCard
          title="Official Notices"
          value={stats.totalNotices}
          icon={Bell}
          color="purple"
          subtitle="Dispatched circulars"
        />
        <DashboardCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="amber"
          subtitle="Awaiting admin action"
        />
      </div>

      {/* Pending Approvals Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pending Event Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty proposals requiring administrative vetting before appearing on the public portal.
            </p>
          </div>
          <Link
            to="/admin/approvals"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Full Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            🎉 All event proposals have been reviewed! No pending submissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Organizer / Faculty</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingList.slice(0, 5).map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{ev.createdBy?.name || ev.organizer}</p>
                      <p className="text-[11px] text-slate-400">{ev.createdBy?.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(ev.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {ev.maxParticipants} seats
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleQuickApprove(ev._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                      >
                        Approve
                      </button>
                      <Link
                        to="/admin/approvals"
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two-Column Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Campus Events</h3>
            <Link to="/admin/events" className="text-xs text-blue-600 font-semibold hover:underline">
              Manage Events
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.recentEvents || []).map((ev) => (
              <div key={ev._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-xs">
                <div>
                  <p className="font-bold text-slate-800 truncate max-w-[240px]">{ev.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(ev.date).toLocaleDateString()} • {ev.venue}
                  </p>
                </div>
                <Badge variant={ev.approvalStatus}>{ev.approvalStatus}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Institutional Notices</h3>
            <Link to="/admin/notices" className="text-xs text-blue-600 font-semibold hover:underline">
              Manage Notices
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.recentNotices || []).map((not) => (
              <div key={not._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-xs">
                <div>
                  <p className="font-bold text-slate-800 truncate max-w-[240px]">{not.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {not.category} • {new Date(not.publishedDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={not.priority}>{not.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
