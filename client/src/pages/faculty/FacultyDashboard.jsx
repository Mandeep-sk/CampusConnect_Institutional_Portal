import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  Users,
  Clock,
  PlusCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error fetching faculty dashboard stats:', error);
      toast.error('Could not load faculty statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling faculty metrics..." />;
  }

  const stats = data?.stats || {};
  const myEvents = data?.myEvents || [];
  const recentNotices = data?.recentNotices || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
            {user?.department} • Faculty Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-xl">
            Manage your departmental events, review student attendee rosters, and broadcast official circulars.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/faculty/create-event"
            className="px-4 py-2.5 bg-white text-blue-800 text-xs font-bold rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Propose Event</span>
          </Link>
          <Link
            to="/faculty/create-notice"
            className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 border border-blue-400/30 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Notice</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="My Authored Events"
          value={stats.myEventsCount}
          icon={Calendar}
          color="blue"
          subtitle={`${stats.myApprovedCount || 0} approved`}
        />
        <DashboardCard
          title="Awaiting Admin Review"
          value={stats.myPendingCount}
          icon={Clock}
          color="amber"
          subtitle="Pending approval"
        />
        <DashboardCard
          title="Registered Attendees"
          value={stats.totalAttendees}
          icon={Users}
          color="emerald"
          subtitle="Total students enrolled"
        />
        <DashboardCard
          title="My Published Notices"
          value={stats.myNoticesCount}
          icon={FileText}
          color="indigo"
          subtitle="Active announcements"
        />
      </div>

      {/* My Events Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Proposed Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Status of your submissions and registration counts.
            </p>
          </div>
          <Link
            to="/faculty/my-events"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All My Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            You haven't proposed any campus events yet. Click 'Propose Event' above to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myEvents.map((ev) => (
              <div
                key={ev._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={ev.approvalStatus}>{ev.approvalStatus}</Badge>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {ev.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(ev.date).toLocaleDateString()} • {ev.venue} • {ev.registeredCount || 0}/{ev.maxParticipants} registered
                  </p>
                  {ev.approvalStatus === 'Rejected' && ev.rejectionReason && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg font-medium mt-1">
                      ⚠️ Admin feedback: "{ev.rejectionReason}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
