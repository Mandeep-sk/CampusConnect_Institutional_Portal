import React, { useState, useEffect } from 'react';
import { Search, Bell, Filter, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import NoticeCard from '../../components/NoticeCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const categories = ['All', 'Academic', 'Examination', 'Admissions', 'Placement', 'Sports', 'General', 'Events'];
const priorities = ['All', 'Urgent', 'Important', 'Normal'];

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedPriority !== 'All') params.priority = selectedPriority;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/notices', { params });
      if (res.data.success) {
        setNotices(res.data.notices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory, selectedPriority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>Institutional Notice Board</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Official Circulars & Announcements
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Stay informed with real-time official notices from the Office of the Controller of
          Examinations, Placement Cell, Dean Academics, and Administration.
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
              placeholder="Search notices by keyword, title, or announcement content..."
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

        {/* Priority and Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1">
              Priority:
            </span>
            {priorities.map((pri) => (
              <button
                key={pri}
                onClick={() => setSelectedPriority(pri)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedPriority === pri
                    ? pri === 'Urgent'
                      ? 'bg-rose-600 text-white'
                      : pri === 'Important'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pri}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <LoadingSpinner text="Fetching official announcements..." />
      ) : notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices found"
          description="There are currently no circulars matching your active filters."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSelectedPriority('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
