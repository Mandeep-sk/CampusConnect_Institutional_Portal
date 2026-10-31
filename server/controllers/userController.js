const User = require('../models/User');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const Notice = require('../models/Notice');

// @desc    Get all users with optional filtering & search
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, department } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting oneself
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot delete their own active account'
      });
    }

    // Prevent deleting default master admin
    if (userToDelete.email === 'admin@campusconnect.com') {
      return res.status(400).json({
        success: false,
        message: 'The primary system administrator account cannot be deleted'
      });
    }

    // Clean up associated registrations if student
    if (userToDelete.role === 'student') {
      const registrations = await EventRegistration.find({ student: userToDelete._id });
      for (const reg of registrations) {
        await Event.findByIdAndUpdate(reg.event, { $inc: { registeredCount: -1 } });
      }
      await EventRegistration.deleteMany({ student: userToDelete._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${userToDelete.name}' has been successfully deleted`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUser
};
