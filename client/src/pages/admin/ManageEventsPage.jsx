import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  PlusCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  X,
  Clock,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Attendees modal
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Deletion modal
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (approvalFilter !== 'all') params.approvalStatus = approvalFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching admin events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [approvalFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

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
      toast.error('Could not fetch event attendees');
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
        toast.success(res.data.message || 'Event deleted');
        setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
        setEventToDelete(null);
      }
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/events/${id}/approve`);
      if (res.data.success) {
        toast.success('Event approved and made public!');
        fetchEvents();
      }
    } catch (e) {
      toast.error('Failed to approve event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Event Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee all technical, cultural, sports, and academic events across departments.
          </p>
        </div>

        <Link
          to="/faculty/create-event"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title, venue, organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setApprovalFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                approvalFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All Events' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading campus events..." />
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No events found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Registered / Capacity</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={ev.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{ev.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ev.venue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{new Date(ev.date).toLocaleDateString()}</p>
                      <p className="text-[11px] text-slate-400">{ev.startTime}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <button
                        onClick={() => openAttendees(ev)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center space-x-1"
                        title="View registered student roster"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {ev.registeredCount || 0} / {ev.maxParticipants}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={ev.approvalStatus}>{ev.approvalStatus}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {ev.approvalStatus === 'Pending' && (
                        <button
                          onClick={() => handleApprove(ev._id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                          title="Approve Submission"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => openAttendees(ev)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View attendees"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEventToDelete(ev)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendees Roster Modal */}
      {attendeesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Student Roster
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
                <LoadingSpinner text="Loading student list..." />
              ) : attendees.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No students have registered for this event yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Roll / ID</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Registered Date</th>
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
                        <td className="px-4 py-3">{reg.student?.department || 'General'}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(reg.registrationDate).toLocaleDateString()}
                        </td>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        title="Delete Event?"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? All existing student registrations will be permanently deleted.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setEventToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageEventsPage;
