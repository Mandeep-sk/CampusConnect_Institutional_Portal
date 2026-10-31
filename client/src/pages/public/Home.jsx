import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Bell,
  ArrowRight,
  Shield,
  Users,
  CheckCircle,
  Sparkles,
  Layers,
  Award,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/EventCard';
import NoticeCard from '../../components/NoticeCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [eventsRes, noticesRes] = await Promise.all([
          api.get('/events?limit=4'),
          api.get('/notices?limit=4')
        ]);

        if (eventsRes.data.success) {
          setEvents(eventsRes.data.events.slice(0, 3));
        }
        if (noticesRes.data.success) {
          setNotices(noticesRes.data.notices.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6 shadow-sm border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>CampusConnect 2026 Institutional Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            The Central Hub for Campus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Events & Notices
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience a modern, unified collegiate portal. Discover academic hackathons, cultural
            fests, workshops, and official administrative notices with real-time seat tracking.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/notices"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold rounded-2xl shadow-sm hover:shadow transition-all"
            >
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Official Circulars</span>
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <span className="text-2xl font-black text-blue-600">500+</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Scholars</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <span className="text-2xl font-black text-indigo-600">45+</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Campus Events</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <span className="text-2xl font-black text-emerald-600">100%</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Verified Circulars</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-black text-purple-600">6</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Academic Depts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Campus Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Upcoming Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registered events feature seat limits, live attendee lists, and official department certifications.
            </p>
          </div>
          <Link
            to="/events"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching campus events..." />
        ) : events.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No approved events currently scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} showRegisterBtn={false} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Notices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Institutional Circulars</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Latest Campus Notices
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct notifications from Examination, Academic, Placement, and Administrative cells.
            </p>
          </div>
          <Link
            to="/notices"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Notices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading notices..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map((notice) => (
              <NoticeCard key={notice._id} notice={notice} />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="bg-slate-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>Institutional Excellence</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Designed to Modernize Higher Education Workflows
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                CampusConnect bridges the communication divide between university administrators,
                department faculty, and the student body. Replacing outdated physical notice boards
                and chaotic messaging groups with an authenticated, role-based platform.
              </p>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Administrative moderation with approval pipelines for faculty event proposals.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Automated participant capacity enforcement preventing event over-subscription.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Instant in-app notification center for urgent academic & exam deadlines.</span>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="relative">
              <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-700">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    CC
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Campus Operating System</h4>
                    <p className="text-xs text-slate-400">Institutional Governance & Student Engagement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Security Standard</p>
                      <p className="text-sm font-bold text-white mt-0.5">JWT & Role-Based Access Control</p>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                      Enforced
                    </span>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Data Persistence</p>
                      <p className="text-sm font-bold text-white mt-0.5">MongoDB Aggregated Schemas</p>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium">
                      Live
                    </span>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Event Concurrency</p>
                      <p className="text-sm font-bold text-white mt-0.5">Strict Capacity Validation</p>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Built for Every Campus Stakeholder</h2>
          <p className="text-sm text-slate-500 mt-2">
            Dedicated workflows designed specifically for Student participation, Faculty organization, and Administrative governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Student Experience</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Browse verified campus events, register with one click, track seat limits, cancel registrations, and view priority circulars.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li>• Real-time seat availability</li>
              <li>• Instant confirmation notices</li>
              <li>• Personal registration ledger</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Faculty Operations</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Submit events for administrative review, track student attendees, post department notices directly, and manage deadlines.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li>• Event proposal submission</li>
              <li>• Live attendee roster viewing</li>
              <li>• Instant department circulars</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Institutional Admin</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Full control over user accounts, event approval pipeline, urgent circular broadcasting, and campus-wide statistics.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li>• Event review & approval queue</li>
              <li>• User management & access control</li>
              <li>• Campus-wide analytics dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Join Your Campus Community?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Register your verified student or faculty credentials today to gain instant access to institutional events, notices, and workshops.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow-md"
              >
                Create Member Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
