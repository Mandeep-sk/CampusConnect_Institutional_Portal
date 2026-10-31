const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { notifyUser, notifyRole, notifyAdmins } = require('../utils/notificationHelper');

// @desc    Get all events with filters (Role-aware)
// @route   GET /api/events
// @access  Public (filtered) / Private
const getEvents = async (req, res, next) => {
  try {
    const { category, search, status, approvalStatus, myEvents } = req.query;
    let query = {};

    // Role-based visibility
    if (!req.user) {
      // Unauthenticated public visitor: ONLY approved events
      query.approvalStatus = 'Approved';
    } else if (req.user.role === 'student') {
      // Student: ONLY approved events
      query.approvalStatus = 'Approved';
    } else if (req.user.role === 'faculty') {
      if (myEvents === 'true') {
        // Faculty viewing their own events
        query.createdBy = req.user.id;
      } else {
        // Faculty browsing events: approved OR their own
        query.$or = [
          { approvalStatus: 'Approved' },
          { createdBy: req.user.id }
        ];
      }
    } else if (req.user.role === 'admin') {
      // Admin can see everything or filter by approvalStatus
      if (approvalStatus && approvalStatus !== 'all') {
        query.approvalStatus = approvalStatus;
      }
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // Status filter (Upcoming, Ongoing, Completed, Cancelled)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search query
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } },
          { organizer: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email department avatar')
      .sort({ date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email department avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Non-admins and non-creators can only see approved events
    if (event.approvalStatus !== 'Approved') {
      if (!req.user || (req.user.role !== 'admin' && event.createdBy._id.toString() !== req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'This event is currently pending administrator review'
        });
      }
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Faculty or Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      date,
      startTime,
      endTime,
      venue,
      organizer,
      maxParticipants,
      registrationDeadline,
      status
    } = req.body;

    const isAdmin = req.user.role === 'admin';
    const approvalStatus = isAdmin ? 'Approved' : 'Pending';

    const event = await Event.create({
      title,
      description,
      category,
      imageUrl: imageUrl || undefined,
      date,
      startTime,
      endTime,
      venue,
      organizer: organizer || req.user.department || req.user.name,
      maxParticipants: Number(maxParticipants),
      registrationDeadline,
      status: status || 'Upcoming',
      approvalStatus,
      createdBy: req.user.id
    });

    // Send notifications
    if (isAdmin) {
      // Direct publication -> notify all students
      await notifyRole({
        role: 'student',
        title: 'New Institutional Event Announced',
        message: `"${event.title}" is now scheduled for ${new Date(event.date).toLocaleDateString()}. Register before capacity is filled!`,
        type: 'event_created',
        relatedId: event._id,
        link: `/events/${event._id}`
      });
    } else {
      // Faculty submission -> notify admins for review
      await notifyAdmins({
        title: 'New Event Approval Request',
        message: `Faculty member ${req.user.name} submitted "${event.title}" for review and approval.`,
        type: 'event_created',
        relatedId: event._id,
        link: `/admin/approvals`
      });
    }

    res.status(201).json({
      success: true,
      message: isAdmin
        ? 'Event published successfully and broadcasted to campus!'
        : 'Event submitted successfully! Awaiting Administrator approval before public listing.',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event details
// @route   PUT /api/events/:id
// @access  Private (Admin or Faculty creator)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this event'
      });
    }

    // Faculty cannot edit if already rejected without re-review
    if (req.user.role === 'faculty' && event.approvalStatus === 'Approved') {
      // Faculty changes might reset approval or admin must review
      req.body.approvalStatus = 'Pending';
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin or Faculty creator)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event'
      });
    }

    // Clean up registrations
    await EventRegistration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Event '${event.title}' and all corresponding registrations have been removed`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event submission
// @route   PUT /api/events/:id/approve
// @access  Private (Admin only)
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.approvalStatus = 'Approved';
    event.rejectionReason = '';
    await event.save();

    // 1. Notify faculty organizer
    if (event.createdBy) {
      await notifyUser({
        recipient: event.createdBy._id,
        title: 'Event Approved 🎉',
        message: `Your event submission "${event.title}" has been approved by the Administration and is now live!`,
        type: 'event_approved',
        relatedId: event._id,
        link: `/events/${event._id}`
      });
    }

    // 2. Broadcast to all students
    await notifyRole({
      role: 'student',
      title: 'New Campus Event Approved',
      message: `"${event.title}" is now open for registration. Check it out now!`,
      type: 'event_approved',
      relatedId: event._id,
      link: `/events/${event._id}`
    });

    res.status(200).json({
      success: true,
      message: `Event '${event.title}' has been approved and published to the student body`,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event submission
// @route   PUT /api/events/:id/reject
// @access  Private (Admin only)
const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.approvalStatus = 'Rejected';
    event.rejectionReason = reason || 'Does not comply with institutional scheduling or guidelines.';
    await event.save();

    // Notify faculty organizer with reason
    if (event.createdBy) {
      await notifyUser({
        recipient: event.createdBy._id,
        title: 'Event Submission Status Update',
        message: `Your event "${event.title}" was not approved. Feedback: "${event.rejectionReason}"`,
        type: 'event_rejected',
        relatedId: event._id,
        link: `/faculty/my-events`
      });
    }

    res.status(200).json({
      success: true,
      message: `Event '${event.title}' status set to Rejected`,
      event
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent
};
