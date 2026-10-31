import React from 'react';

const Badge = ({ variant = 'default', children, className = '', pulse = false }) => {
  const variants = {
    // Approval
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',

    // Priorities
    Urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    Important: 'bg-amber-100 text-amber-800 border-amber-300',
    Normal: 'bg-blue-50 text-blue-700 border-blue-200',

    // Event Status
    Upcoming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-slate-100 text-slate-700 border-slate-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',

    // Roles
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    faculty: 'bg-sky-50 text-sky-700 border-sky-200',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    // Default
    default: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const badgeStyle = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
