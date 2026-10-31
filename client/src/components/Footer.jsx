import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Shield, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-blue-500">Connect</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The unified institutional event management and official notice board system.
              Empowering students, faculty, and campus administrators with seamless communication,
              event registrations, and timely academic announcements.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Portal Operational (2026 Edition)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">Institutional Home</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-blue-400 transition">Upcoming Campus Events</Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-blue-400 transition">Official Circulars & Notices</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition">Member Portal Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition">Student / Faculty Registration</Link>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Divisions</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Computer Science & Engg.</li>
              <li>Electronics & Communication</li>
              <li>Mechanical & Civil Engg.</li>
              <li>Controller of Examinations</li>
              <li>Training & Placement Cell</li>
              <li>Student Welfare Committee</li>
            </ul>
          </div>

          {/* Campus Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Campus Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>North Academic Block, University Campus, Knowledge Park IV</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+1 (800) 555-CAMPUS / Ext. 204</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>helpdesk@campusconnect.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect Portal. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Guidelines</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
