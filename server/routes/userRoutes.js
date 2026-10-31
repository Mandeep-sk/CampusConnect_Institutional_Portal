const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUserById);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
