import React, { useState, useEffect } from 'react';
import {
  Bell,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const categories = ['Academic', 'Examination', 'Admissions', 'Placement', 'Sports', 'General', 'Events'];
const priorities = ['Normal', 'Important', 'Urgent'];

const MyNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const fetchMyNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices?myNotices=true');
      if (res.data.success) {
        setNotices(res.data.notices);
      }
    } catch (error) {
      console.error('Error fetching faculty notices:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNotices();
  }, []);

  const openEditModal = (not) => {
    setEditingNotice(not);
    setFormData({
      title: not.title,
      description: not.description,
      category: not.category,
      priority: not.priority,
      expiryDate: not.expiryDate ? not.expiryDate.split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await api.put(`/notices/${editingNotice._id}`, formData);
      if (res.data.success) {
        toast.success('Notice updated successfully');
        setIsEditModalOpen(false);
        fetchMyNotices();
      }
    } catch (error) {
      toast.error('Failed to update notice');
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
        toast.success('Notice removed');
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
            My Published Notices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department announcements and student circulars published under your faculty account.
          </p>
        </div>

        <Link
          to="/faculty/create-notice"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Notice</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving notices..." />
      ) : notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices published yet"
          description="You haven't posted any announcements to the student board yet."
          actionText="Publish Your First Notice"
          actionLink="/faculty/create-notice"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={n.priority} pulse={n.priority === 'Urgent'}>
                      {n.priority}
                    </Badge>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {n.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.publishedDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2">{n.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {n.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/notices/${n._id}`}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  View Details
                </Link>
                <div className="flex items-center space-x-1">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Published Notice</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {formLoading ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!noticeToDelete}
        title="Delete Notice?"
        message={`Are you sure you want to remove "${noticeToDelete?.title}" from the notice board?`}
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

export default MyNoticesPage;
