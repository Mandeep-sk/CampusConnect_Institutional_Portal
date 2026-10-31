import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

const imagePresets = [
  { label: 'Technical / Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60' },
  { label: 'Cultural / Fest', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60' },
  { label: 'Robotics / IoT', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60' },
  { label: 'AI & Cloud Seminar', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60' },
  { label: 'Sports Meet', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60' },
  { label: 'Startup Pitch', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' }
];

const CreateEventPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    imageUrl: imagePresets[0].url,
    date: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: '',
    organizer: user?.department || 'Department Committee',
    maxParticipants: 100,
    registrationDeadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.registrationDeadline) > new Date(formData.date)) {
      toast.error('Registration deadline cannot be after the event date');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/events', formData);
      if (res.data.success) {
        toast.success(res.data.message || 'Event submitted successfully!');
        if (isAdmin) {
          navigate('/admin/events');
        } else {
          navigate('/faculty/my-events');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={isAdmin ? '/admin/events' : '/faculty/my-events'}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Management</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isAdmin ? 'Publish New Institutional Event' : 'Submit Event Proposal'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isAdmin
            ? 'Administrator-created events are published immediately and broadcasted to all students.'
            : 'Faculty-created events will be routed to Administration for schedule clearance and approval.'}
        </p>
      </div>

      {!isAdmin && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-2 text-blue-800 text-xs font-medium">
          <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>
            Compliance Policy: Your event submission will appear as "Pending" until verified by an Administrator.
          </span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. National Hackathon 2026: Code for Impact"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Organizing Body / Department
              </label>
              <input
                type="text"
                name="organizer"
                required
                value={formData.organizer}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Description & Guidelines
            </label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Provide a comprehensive summary of the event objectives, speaker details, rules, and eligibility..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Banner Image Preset or Custom URL
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {imagePresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                  className={`p-2 rounded-xl border text-left text-xs transition flex items-center space-x-2 ${
                    formData.imageUrl === preset.url
                      ? 'border-blue-600 bg-blue-50 font-bold text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-6 h-6 rounded-lg object-cover" />
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
            <input
              type="url"
              name="imageUrl"
              placeholder="Or enter custom image URL: https://..."
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                name="startTime"
                required
                placeholder="e.g. 10:00 AM"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                name="endTime"
                required
                placeholder="e.g. 02:00 PM"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Venue */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Venue / Hall
              </label>
              <input
                type="text"
                name="venue"
                required
                placeholder="e.g. Auditorium Hall 2"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capacity (Max Seats)
              </label>
              <input
                type="number"
                name="maxParticipants"
                min="1"
                required
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Registration Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                required
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : isAdmin ? 'Publish Event Immediately' : 'Submit Proposal for Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
