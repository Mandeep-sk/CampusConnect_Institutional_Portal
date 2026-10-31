import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancellingRegistration, setCancellingRegistration] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancellingRegistration) return;
    try {
      setCancelLoading(true);
      const res = await api.delete(`/registrations/${cancellingRegistration._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Registration cancelled');
        setRegistrations((prev) => prev.filter((r) => r._id !== cancellingRegistration._id));
        setCancellingRegistration(null);
      }
    } catch (error) {
      toast.error('Could not cancel registration');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Event Registrations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your enrolled institutional events, access schedule timings, and manage your seats.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your confirmed events..." />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="No registered events found"
          description="You haven't signed up for any campus events yet. Explore upcoming hackathons, sports tournaments, and seminars!"
          actionText="Browse Upcoming Events"
          actionLink="/student/events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const ev = reg.event;
            if (!ev) return null;
            return (
              <div
                key={reg._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Registration Confirmed</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {ev.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{new Date(ev.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/events/${ev._id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>Event Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setCancellingRegistration(reg)}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingRegistration}
        title="Cancel Seat Registration?"
        message={`Are you sure you want to cancel your seat for "${cancellingRegistration?.event?.title}"? Your spot will be made available to other students.`}
        confirmText="Yes, Cancel Seat"
        cancelText="Keep My Seat"
        isDestructive={true}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancellingRegistration(null)}
        loading={cancelLoading}
      />
    </div>
  );
};

export default MyRegistrationsPage;
