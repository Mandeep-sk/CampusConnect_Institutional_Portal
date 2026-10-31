import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const categories = ['All', 'Academic', 'Examination', 'Admissions', 'Placement', 'Sports', 'General', 'Events'];
const priorities = ['Normal', 'Important', 'Urgent'];

const ManageNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Normal',
    expiryDate: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion State
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

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
  }, [categoryFilter]);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      priority: 'Normal',
      expiryDate: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (not) => {
    setEditingNotice(not);
    setFormData({
      title: not.title,
      description: not.description,
      category: not.category,
      priority: not.priority,
      expiryDate: not.expiryDate ? not.expiryDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingNotice) {
        const res = await api.put(`/notices/${editingNotice._id}`, formData);
        if (res.data.success) {
          toast.success('Notice updated successfully');
          setIsModalOpen(false);
          fetchNotices();
        }
      } else {
        const res = await api.post('/notices', formData);
        if (res.data.success) {
          toast.success('Notice published to campus notice board!');
          setIsModalOpen(false);
          fetchNotices();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!noticeToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/notices/${noticeToDelete._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Notice deleted');
        setNotices((prev) => prev.filter((n) => n._id !== noticeToDelete._id));
        setNoticeToDelete(null);
      }
    } catch (error) {
      toast.error('Could not delete notice');
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
            Campus Circulars & Notice Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, update, or archive official college announcements with custom priorities.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchNotices();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notices by title, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving notices..." />
        ) : notices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notices found for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Notice Title & Preview</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Published By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {notices.map((n) => (
                  <tr key={n._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-slate-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {n.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={n.priority} pulse={n.priority === 'Urgent'}>
                        {n.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{n.createdBy?.name || 'Admin Office'}</p>
                      <p className="text-[11px] text-slate-400">{n.createdBy?.department}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(n.publishedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(n)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit notice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setNoticeToDelete(n)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete notice"
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

      {/* Create / Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingNotice ? 'Edit Institutional Notice' : 'Publish New Institutional Notice'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Examination Hall Allotment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p} Priority</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Announcement Content
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter the complete institutional circular notice text..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {formLoading ? 'Saving...' : editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!noticeToDelete}
        title="Delete Institutional Notice?"
        message={`Are you sure you want to remove "${noticeToDelete?.title}" from the campus board?`}
        confirmText="Yes, Delete Notice"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setNoticeToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageNoticesPage;
