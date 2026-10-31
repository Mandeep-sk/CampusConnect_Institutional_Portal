import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error(error.response?.data?.message || 'Could not load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (isStudent) {
      try {
        const res = await api.get('/registrations/my');
        if (res.data.success) {
          const match = res.data.registrations.find((r) => (r.event?._id || r.event) === id);
          if (match) {
            setIsRegistered(true);
            setRegistrationId(match._id);
          } else {
            setIsRegistered(false);
            setRegistrationId(null);
          }
        }
      } catch (e) {
        console.error('Error checking registration status:', e);
      }
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (event) {
      checkRegistrationStatus();
    }
  }, [event, isStudent]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isStudent) {
      toast.error('Only students can register for events');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/registrations/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Successfully registered for this event!');
        setIsRegistered(true);
        if (res.data.registration) {
          setRegistrationId(res.data.registration._id);
        }
        setEvent((prev) => ({
          ...prev,
          registeredCount: (prev.registeredCount || 0) + 1
        }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationId) return;

    try {
      setActionLoading(true);
      const res = await api.delete(`/registrations/${registrationId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Registration cancelled');
        setIsRegistered(false);
        setRegistrationId(null);
        setShowCancelDialog(false);
        setEvent((prev) => ({
          ...prev,
          registeredCount: Math.max(0, (prev.registeredCount || 0) - 1)
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel registration');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading event specifications..." />;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">
          The requested event may have been removed or does not exist.
        </p>
        <Link
          to="/events"
          className="mt-6 inline-flex items-center space-x-2 text-blue-600 font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const isFull = (event.registeredCount || 0) >= (event.maxParticipants || 1);
  const percentage = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.maxParticipants || 1)) * 100)
  );

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const deadlineDate = new Date(event.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Event Directory</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-96 w-full bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Badges in hero */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-xs font-bold text-blue-700 rounded-full shadow">
              {event.category}
            </span>
            <Badge variant={event.status}>{event.status}</Badge>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-blue-300">
              <Calendar className="w-4 h-4" />
              <span>{eventDate}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Details & Registration Actions */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                About this Event
              </h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Schedule</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                    {event.startTime} – {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Location / Venue</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                    {event.venue}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Organized By</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                    {event.organizer}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Faculty Coordinator</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                    {event.createdBy?.name || 'Academic Faculty'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Sidebar Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-4">Registration Status</h4>

              {/* Capacity Progress */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Seats Occupied</span>
                  <span className="font-bold text-slate-800">
                    {event.registeredCount || 0} / {event.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 100
                        ? 'bg-rose-500'
                        : percentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {event.maxParticipants - (event.registeredCount || 0)} spots remaining
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-semibold text-slate-800">{deadlineDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eligibility:</span>
                  <span className="font-semibold text-slate-800">All Registered Students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee:</span>
                  <span className="font-semibold text-emerald-600">Free / Institutional</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>You are confirmed for this event!</span>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl transition"
                  >
                    Cancel My Registration
                  </button>
                </div>
              ) : isFull ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 text-xs font-semibold">
                  Event is fully booked. Registration closed.
                </div>
              ) : isAuthenticated && isStudent ? (
                <button
                  disabled={actionLoading}
                  onClick={handleRegister}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{actionLoading ? 'Registering...' : 'Register for Event'}</span>
                </button>
              ) : isAuthenticated && !isStudent ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-blue-700 text-xs font-medium">
                  Signed in as {user.role}. Registration is for students.
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full block text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition"
                >
                  Sign In to Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for cancelling registration */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel Event Registration?"
        message={`Are you sure you want to cancel your seat for "${event.title}"? Your spot will be released to other students.`}
        confirmText="Yes, Cancel Seat"
        cancelText="Keep My Spot"
        isDestructive={true}
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelDialog(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default EventDetailsPage;
