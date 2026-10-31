const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const { notifyUser } = require('../utils/notificationHelper');

// @desc    Register current student for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student only)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const studentId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.approvalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available. Event is not yet approved.'
      });
    }

    // Check if event is cancelled or completed
    if (event.status === 'Cancelled' || event.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Registration is closed because this event is ${event.status.toLowerCase()}.`
      });
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed. The deadline for this event has passed.'
      });
    }

    // Check capacity
    if (event.registeredCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This event has reached its maximum participant capacity.'
      });
    }

    // Check if duplicate registration
    const existingRegistration = await EventRegistration.findOne({
      event: eventId,
      student: studentId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.'
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      event: eventId,
      student: studentId,
      notes: notes || '',
      status: 'Confirmed'
    });

    // Increment event registeredCount
    event.registeredCount += 1;
    await event.save();

    // Send confirmation in-app notification to student
    await notifyUser({
      recipient: studentId,
      title: 'Registration Confirmed! 🎉',
      message: `You have successfully registered for "${event.title}" scheduled on ${new Date(event.date).toLocaleDateString()} at ${event.venue}.`,
      type: 'registration_success',
      relatedId: event._id,
      link: `/student/my-registrations`
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! See you at the event.',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's registered events
// @route   GET /api/registrations/my
// @access  Private (Student only)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user.id
    })
      .populate({
        path: 'event',
        select: 'title description category imageUrl date startTime endTime venue organizer maxParticipants registeredCount status approvalStatus'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students registered for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Admin or Faculty creator)
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify permission: Admin or creator
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view the attendee list for this event'
      });
    }

    const registrations = await EventRegistration.find({ event: eventId })
      .populate('student', 'name email department studentId phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        maxParticipants: event.maxParticipants,
        registeredCount: event.registeredCount
      },
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student owner or Admin)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await EventRegistration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    // Only registered student or admin can cancel
    if (req.user.role !== 'admin' && registration.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this registration'
      });
    }

    const event = await Event.findById(registration.event._id);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    await EventRegistration.findByIdAndDelete(req.params.id);

    // Send cancellation notification to student
    await notifyUser({
      recipient: registration.student,
      title: 'Registration Cancelled',
      message: `Your registration for "${event ? event.title : 'the event'}" has been cancelled.`,
      type: 'registration_cancelled',
      relatedId: event ? event._id : null,
      link: `/events`
    });

    res.status(200).json({
      success: true,
      message: 'Registration has been successfully cancelled'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration
};
