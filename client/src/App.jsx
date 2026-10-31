import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import EventsPage from './pages/public/EventsPage';
import EventDetailsPage from './pages/public/EventDetailsPage';
import NoticesPage from './pages/public/NoticesPage';
import NoticeDetailsPage from './pages/public/NoticeDetailsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageEventsPage from './pages/admin/ManageEventsPage';
import EventApprovalsPage from './pages/admin/EventApprovalsPage';
import ManageNoticesPage from './pages/admin/ManageNoticesPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MyEventsPage from './pages/faculty/MyEventsPage';
import CreateEventPage from './pages/faculty/CreateEventPage';
import MyNoticesPage from './pages/faculty/MyNoticesPage';
import CreateNoticePage from './pages/faculty/CreateNoticePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseEventsPage from './pages/student/BrowseEventsPage';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';
import AllNoticesPage from './pages/student/AllNoticesPage';
import NotificationsPage from './pages/student/NotificationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500
          }
        }}
      />

      <Routes>
        {/* Public Website Flow */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/notices/:id" element={<NoticeDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Administrator Dashboard Flow */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="events" element={<ManageEventsPage />} />
          <Route path="approvals" element={<EventApprovalsPage />} />
          <Route path="notices" element={<ManageNoticesPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Faculty Dashboard Flow */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="my-events" element={<MyEventsPage />} />
          <Route path="create-event" element={<CreateEventPage />} />
          <Route path="my-notices" element={<MyNoticesPage />} />
          <Route path="create-notice" element={<CreateNoticePage />} />
        </Route>

        {/* Student Dashboard Flow */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="events" element={<BrowseEventsPage />} />
          <Route path="my-registrations" element={<MyRegistrationsPage />} />
          <Route path="notices" element={<AllNoticesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
