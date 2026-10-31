import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookmarkCheck,
  Bell,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
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
      console.error('Error fetching student dashboard stats:', error);
      toast.error('Could not load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your student workspace..." />;
  }

  const stats = data?.stats || {};
  const myRegistrations = data?.myRegistrations || [];
  const latestNotices = data?.latestNotices || [];
  const nextEvent = myRegistrations[0]?.event || null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            {user?.department} • ID: {user?.studentId || 'N/A'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Hello, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            You are enrolled in {stats.myRegistrationsCount || 0} campus events. Stay tuned to urgent notices and upcoming deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/student/events"
            className="px-4 py-2.5 bg-white text-blue-800 text-xs font-bold rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center space-x-1.5"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Browse Events</span>
          </Link>
          <Link
            to="/student/my-registrations"
            className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 border border-blue-400/30 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>My Registrations</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="My Registered Events"
          value={stats.myRegistrationsCount}
          icon={BookmarkCheck}
          color="emerald"
          subtitle="Confirmed participations"
        />
        <DashboardCard
          title="Upcoming Campus Events"
          value={stats.upcomingEventsCount}
          icon={Calendar}
          color="blue"
          subtitle="Open for registration"
        />
        <DashboardCard
          title="Urgent Circulars"
          value={stats.urgentNoticesCount}
          icon={AlertTriangle}
          color="rose"
          subtitle="Requires attention"
        />
        <DashboardCard
          title="Unread Notifications"
          value={stats.unreadNotificationsCount}
          icon={Bell}
          color="purple"
          subtitle="Recent announcements"
        />
      </div>

      {/* Next Upcoming Registered Event Spotlight */}
      {nextEvent && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Next Registered Event</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{nextEvent.title}</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(nextEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{nextEvent.startTime} - {nextEvent.endTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{nextEvent.venue}</span>
              </div>
            </div>
          </div>
          <Link
            to={`/events/${nextEvent._id}`}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
          >
            <span>View Event Pass</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Two Column Layout: Registered Events & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">My Active Registrations</h3>
            <Link to="/student/my-registrations" className="text-xs text-blue-600 font-semibold hover:underline">
              View All ({stats.myRegistrationsCount || 0})
            </Link>
          </div>
          {myRegistrations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              You haven't registered for any events yet.{' '}
              <Link to="/student/events" className="text-blue-600 font-bold hover:underline">
                Explore campus events
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRegistrations.map((reg) => {
                const ev = reg.event;
                if (!ev) return null;
                return (
                  <div key={reg._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1 inline-block">
                        {ev.category}
                      </span>
                      <p className="font-bold text-slate-800 line-clamp-1">{ev.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(ev.date).toLocaleDateString()} • {ev.venue}
                      </p>
                    </div>
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition"
                    >
                      Details
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Latest Campus Notices */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Campus Notices</h3>
            <Link to="/student/notices" className="text-xs text-blue-600 font-semibold hover:underline">
              Notice Board
            </Link>
          </div>
          {latestNotices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent announcements.
            </div>
          ) : (
            <div className="space-y-3">
              {latestNotices.map((n) => (
                <div key={n._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-1 flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={n.priority} pulse={n.priority === 'Urgent'}>
                        {n.priority}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(n.publishedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 line-clamp-1">{n.title}</p>
                  </div>
                  <Link
                    to={`/notices/${n._id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition flex-shrink-0"
                  >
                    Read
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
