import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  PlusCircle,
  Trash2,
  Clock,
  MapPin,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Attendees modal
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Deletion modal
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?myEvents=true');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching faculty events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const openAttendees = async (ev) => {
    setSelectedEvent(ev);
    setAttendeesModalOpen(true);
    try {
      setAttendeesLoading(true);
      const res = await api.get(`/registrations/event/${ev._id}`);
      if (res.data.success) {
        setAttendees(res.data.registrations);
      }
    } catch (error) {
      toast.error('Could not fetch student attendee list');
    } finally {
      setAttendeesLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/events/${eventToDelete._id}`);
      if (res.data.success) {
        toast.success('Event removed');
        setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
        setEventToDelete(null);
      }
    } catch (error) {
      toast.error('Could not delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Organized Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approval reviews, participant counts, and student attendance for your department's events.
          </p>
        </div>

        <Link
          to="/faculty/create-event"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Propose New Event</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events authored yet"
          description="You haven't submitted any event proposals. Click below to submit your first event proposal."
          actionText="Submit Event Proposal"
          actionLink="/faculty/create-event"
        />
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={ev.approvalStatus}>{ev.approvalStatus}</Badge>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {ev.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    Deadline: {new Date(ev.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{ev.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
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
                  <div className="flex items-center space-x-1 text-blue-600 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {ev.registeredCount || 0} / {ev.maxParticipants} students registered
                    </span>
                  </div>
                </div>

                {/* Show rejection reason if rejected */}
                {ev.approvalStatus === 'Rejected' && ev.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <span className="font-bold">Administrative Feedback: </span>
                      <span>{ev.rejectionReason}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => openAttendees(ev)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Roster</span>
                </button>
                <Link
                  to={`/events/${ev._id}`}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  View
                </Link>
                {ev.approvalStatus === 'Pending' && (
                  <button
                    onClick={() => setEventToDelete(ev)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Withdraw proposal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendees Modal */}
      {attendeesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Students ({attendees.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedEvent?.title}</p>
              </div>
              <button
                onClick={() => setAttendeesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {attendeesLoading ? (
                <LoadingSpinner text="Loading attendee records..." />
              ) : attendees.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No students have registered for this event yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Roll Number</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendees.map((reg) => (
                      <tr key={reg._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {reg.student?.name}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {reg.student?.email}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{reg.student?.studentId || '—'}</td>
                        <td className="px-4 py-3">{reg.student?.department}</td>
                        <td className="px-4 py-3 text-slate-500">{reg.student?.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setAttendeesModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        title="Withdraw Event Proposal?"
        message={`Are you sure you want to withdraw "${eventToDelete?.title}"?`}
        confirmText="Yes, Withdraw"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setEventToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyEventsPage;
