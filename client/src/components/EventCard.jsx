import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';

const EventCard = ({ event, onRegister, isRegistered = false, showRegisterBtn = true }) => {
  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const percentage = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.maxParticipants || 1)) * 100)
  );

  const isFull = (event.registeredCount || 0) >= (event.maxParticipants || 1);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-blue-700 rounded-full shadow-sm">
            {event.category}
          </span>
        </div>

        {/* Approval or Status badge if needed */}
        {event.approvalStatus && event.approvalStatus !== 'Approved' && (
          <div className="absolute top-3 right-3">
            <Badge variant={event.approvalStatus}>{event.approvalStatus}</Badge>
          </div>
        )}

        {/* Date banner */}
        <div className="absolute bottom-3 left-3 text-white flex items-center space-x-1.5 text-xs font-medium bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Details list */}
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Capacity</span>
            <span className="font-medium text-slate-700">
              {event.registeredCount || 0} / {event.maxParticipants} spots
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              to={`/events/${event._id}`}
              className="flex-1 text-center py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {showRegisterBtn && (
              <>
                {isRegistered ? (
                  <span className="py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center justify-center">
                    ✓ Registered
                  </span>
                ) : isFull ? (
                  <span className="py-2 px-3 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl flex items-center justify-center">
                    Full
                  </span>
                ) : onRegister ? (
                  <button
                    onClick={() => onRegister(event._id)}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm hover:shadow"
                  >
                    Register
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
