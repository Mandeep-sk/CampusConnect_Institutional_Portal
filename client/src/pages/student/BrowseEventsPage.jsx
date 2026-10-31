import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Sparkles } from 'lucide-react';
import api from '../../services/api';
import EventCard from '../../components/EventCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

const BrowseEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const [eventsRes, regsRes] = await Promise.all([
        api.get('/events', { params }),
        api.get('/registrations/my')
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events);
      }
      if (regsRes.data.success) {
        setMyRegistrations(regsRes.data.registrations.map((r) => r.event?._id || r.event));
      }
    } catch (error) {
      console.error('Error fetching student events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/registrations/${eventId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Seat confirmed! See you there.');
        setMyRegistrations((prev) => [...prev, eventId]);
        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not register for event');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Browse Campus Events
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore upcoming departmental workshops, hackathons, and athletic tournaments. Register with 1-click.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event, speaker, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Loading campus events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Try adjusting your filter or search query."
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

export default BrowseEventsPage;
