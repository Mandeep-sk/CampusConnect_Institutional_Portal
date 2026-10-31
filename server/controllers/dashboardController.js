const User = require('../models/User');
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');

// @desc    Get real-time dashboard statistics tailored by user role
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'admin') {
      const [
        totalStudents,
        totalFaculty,
        totalEvents,
        totalNotices,
        pendingApprovals,
        approvedEvents,
        totalRegistrations,
        recentEvents,
        recentNotices,
        pendingList
      ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Event.countDocuments(),
        Notice.countDocuments(),
        Event.countDocuments({ approvalStatus: 'Pending' }),
        Event.countDocuments({ approvalStatus: 'Approved' }),
        EventRegistration.countDocuments(),
        Event.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name email department'),
        Notice.find().sort({ publishedDate: -1 }).limit(5).populate('createdBy', 'name email department'),
        Event.find({ approvalStatus: 'Pending' }).populate('createdBy', 'name email department').sort({ createdAt: -1 })
      ]);

      return res.status(200).json({
        success: true,
        role: 'admin',
        stats: {
          totalStudents,
          totalFaculty,
          totalEvents,
          totalNotices,
          pendingApprovals,
          approvedEvents,
          totalRegistrations
        },
        recentEvents,
        recentNotices,
        pendingList
      });
    }

    if (role === 'faculty') {
      const [
        myEventsCount,
        myApprovedCount,
        myPendingCount,
        myNoticesCount,
        myEvents,
        recentGlobalNotices
      ] = await Promise.all([
        Event.countDocuments({ createdBy: userId }),
        Event.countDocuments({ createdBy: userId, approvalStatus: 'Approved' }),
        Event.countDocuments({ createdBy: userId, approvalStatus: 'Pending' }),
        Notice.countDocuments({ createdBy: userId }),
        Event.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(6),
        Notice.find().sort({ publishedDate: -1 }).limit(5).populate('createdBy', 'name email department')
      ]);

      // Calculate total attendees across all events created by this faculty
      const facultyEvents = await Event.find({ createdBy: userId }).select('registeredCount');
      const totalAttendees = facultyEvents.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);

      return res.status(200).json({
        success: true,
        role: 'faculty',
        stats: {
          myEventsCount,
          myApprovedCount,
          myPendingCount,
          myNoticesCount,
          totalAttendees
        },
        myEvents,
        recentNotices: recentGlobalNotices
      });
    }

    if (role === 'student') {
      const [
        myRegistrationsCount,
        upcomingEventsCount,
        urgentNoticesCount,
        unreadNotificationsCount,
        myRegistrations,
        latestNotices,
        upcomingEvents
      ] = await Promise.all([
        EventRegistration.countDocuments({ student: userId }),
        Event.countDocuments({ approvalStatus: 'Approved', status: 'Upcoming' }),
        Notice.countDocuments({ priority: 'Urgent' }),
        Notification.countDocuments({ recipient: userId, isRead: false }),
        EventRegistration.find({ student: userId })
          .populate({
            path: 'event',
            select: 'title date venue startTime endTime category imageUrl status'
          })
          .sort({ createdAt: -1 })
          .limit(4),
        Notice.find().sort({ publishedDate: -1 }).limit(5).populate('createdBy', 'name department'),
        Event.find({ approvalStatus: 'Approved' }).sort({ date: 1 }).limit(4)
      ]);

      return res.status(200).json({
        success: true,
        role: 'student',
        stats: {
          myRegistrationsCount,
          upcomingEventsCount,
          urgentNoticesCount,
          unreadNotificationsCount
        },
        myRegistrations,
        latestNotices,
        upcomingEvents
      });
    }

    res.status(200).json({ success: true, message: 'Stats not available for this role' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
