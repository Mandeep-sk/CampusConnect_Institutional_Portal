import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Users,
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const EventApprovalsPage = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingEvent, setRejectingEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?approvalStatus=Pending');
      if (res.data.success) {
        setPendingEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (eventId, title) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/events/${eventId}/approve`);
      if (res.data.success) {
        toast.success(`"${title}" approved and published to students!`);
        setPendingEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch (error) {
      toast.error('Failed to approve event submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingEvent) return;

    try {
      setActionLoading(true);
      const res = await api.put(`/events/${rejectingEvent._id}/reject`, {
        reason: rejectionReason
      });
      if (res.data.success) {
        toast.success(`"${rejectingEvent.title}" rejected. Faculty notified.`);
        setPendingEvents((prev) => prev.filter((e) => e._id !== rejectingEvent._id));
        setRejectingEvent(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error('Failed to record rejection');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Vetting & Compliance Pipeline</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Event Submission Approvals
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review faculty proposals, verify schedule availability, and publish approved events to the student body.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading approval queue..." />
      ) : pendingEvents.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Approval Queue is Clear"
          description="There are currently no event submissions awaiting review. Great job!"
        />
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:shadow-md transition"
            >
              {/* Event Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                    {ev.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Submitted by: <strong className="text-slate-800">{ev.createdBy?.name || ev.organizer}</strong> ({ev.createdBy?.department})
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {ev.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-50">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.startTime} - {ev.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.venue}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: {ev.maxParticipants} students</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(ev._id, ev.title)}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => setRejectingEvent(ev)}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Reject Event Submission</h3>
            </div>
            <p className="text-xs text-slate-500">
              Please provide feedback explaining why "{rejectingEvent.title}" is not approved.
              This explanation will be delivered directly to the faculty member.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Rejection / Changes Required
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Venue is already reserved on this date. Please reschedule or select Block B auditorium."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApprovalsPage;
