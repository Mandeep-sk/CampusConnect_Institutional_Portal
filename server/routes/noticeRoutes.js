const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

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

router.get('/', optionalAuth, getNotices);
router.get('/:id', optionalAuth, getNoticeById);
router.post('/', protect, authorize('admin', 'faculty'), createNotice);
router.put('/:id', protect, authorize('admin', 'faculty'), updateNotice);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteNotice);

module.exports = router;
