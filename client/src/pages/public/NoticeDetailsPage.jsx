import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Printer,
  Building,
  CheckCircle2,
  Share2
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const NoticeDetailsPage = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/notices/${id}`);
        if (res.data.success) {
          setNotice(res.data.notice);
        }
      } catch (error) {
        console.error('Error fetching notice details:', error);
        toast.error('Could not load notice');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading circular..." />;
  }

  if (!notice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Notice Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">This circular may have expired or was removed.</p>
        <Link
          to="/notices"
          className="mt-6 inline-flex items-center space-x-2 text-blue-600 font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Notice Board</span>
        </Link>
      </div>
    );
  }

  const isUrgent = notice.priority === 'Urgent';
  const pubDate = new Date(notice.publishedDate || notice.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/notices"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Circulars</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Circular</span>
        </button>
      </div>

      {/* Main Notice Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Priority Banner Header */}
        {isUrgent && (
          <div className="bg-rose-600 text-white px-6 py-2.5 flex items-center space-x-2 text-xs font-bold tracking-wide">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>URGENT CAMPUS NOTICE – IMMEDIATE ATTENTION MANDATORY</span>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* Top Meta */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <Badge variant={notice.priority} pulse={isUrgent}>
                {notice.priority} Priority
              </Badge>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Division: {notice.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Published on {pubDate}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {notice.title}
            </h1>
          </div>

          {/* Author info pill */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {notice.createdBy?.name ? notice.createdBy.name[0] : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{notice.createdBy?.name || 'Administrative Authority'}</p>
              <p className="text-xs text-slate-500">
                {notice.createdBy?.department || 'Main Administration'} • {notice.createdBy?.role?.toUpperCase() || 'OFFICE'}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
            {notice.description}
          </div>

          {/* Expiry / Signoff */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              {notice.expiryDate && (
                <span>Valid until: {new Date(notice.expiryDate).toLocaleDateString()}</span>
              )}
            </div>
            <div className="text-slate-500 italic">
              Verified by CampusConnect Institutional Governance Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailsPage;
