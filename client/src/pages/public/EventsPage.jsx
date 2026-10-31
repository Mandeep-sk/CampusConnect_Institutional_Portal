import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Sparkles } from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/EventCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isStudent } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    if (isStudent) {
      try {
        const res = await api.get('/registrations/my');
        if (res.data.success) {
          setMyRegistrations(res.data.registrations.map((r) => r.event?._id || r.event));
        }
      } catch (e) {
        console.error('Error fetching my registrations:', e);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  useEffect(() => {
    fetchMyRegistrations();
  }, [isStudent]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please sign in to register for events');
      return;
    }
    if (!isStudent) {
      toast.error('Only registered students can participate in event registrations');
      return;
    }

    try {
      const res = await api.post(`/registrations/${eventId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Registration successful!');
        setMyRegistrations((prev) => [...prev, eventId]);
        // Update local event count
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === eventId ? { ...ev, registeredCount: (ev.registeredCount || 0) + 1 } : ev
          )
        );
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not complete registration';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Calendar className="w-4 h-4" />
          <span>Official Event Calendar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Events
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Stay connected with upcoming hackathons, tech workshops, cultural festivals, and seminars.
          Register directly through your student account.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, venue, or organizing body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1 pr-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Loading campus events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Try selecting a different category or search keyword."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegister={handleRegister}
              isRegistered={myRegistrations.includes(event._id)}
              showRegisterBtn={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
