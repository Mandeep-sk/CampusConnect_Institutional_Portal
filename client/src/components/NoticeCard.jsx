import React from 'react';
import { Calendar, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';

const NoticeCard = ({ notice, onSelect }) => {
  if (!notice) return null;

  const isUrgent = notice.priority === 'Urgent';
  const isImportant = notice.priority === 'Important';
  const pubDate = new Date(notice.publishedDate || notice.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between ${
        isUrgent
          ? 'border-rose-300 shadow-sm hover:shadow-md ring-1 ring-rose-100 bg-rose-50/20'
          : isImportant
          ? 'border-amber-200 hover:shadow-md bg-amber-50/10'
          : 'border-slate-200/80 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant={notice.priority} pulse={isUrgent}>
              {notice.priority}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {notice.category}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{pubDate}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition">
          {notice.title}
        </h4>

        {/* Content Excerpt */}
        <p className="text-slate-600 text-xs mt-2.5 line-clamp-3 leading-relaxed">
          {notice.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
            {notice.createdBy?.name ? notice.createdBy.name[0] : 'U'}
          </div>
          <span className="truncate max-w-[140px] font-medium">
            {notice.createdBy?.name || 'Academic Office'}
          </span>
        </div>

        {onSelect ? (
          <button
            onClick={() => onSelect(notice)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/notices/${notice._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default NoticeCard;
