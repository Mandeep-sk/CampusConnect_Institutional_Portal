const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Optional auth helper so public visitors can browse, but logged in users are recognized
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusconnect_jwt_secret_dev_key');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public routes
    }
  }
  next();
};

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);
router.post('/', protect, authorize('admin', 'faculty'), createEvent);
router.put('/:id', protect, authorize('admin', 'faculty'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteEvent);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);
router.put('/:id/reject', protect, authorize('admin'), rejectEvent);

module.exports = router;
