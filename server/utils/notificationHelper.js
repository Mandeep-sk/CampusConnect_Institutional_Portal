const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send notification to a single user
 */
const notifyUser = async ({ recipient, title, message, type = 'system', relatedId = null, link = '' }) => {
  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedId,
      link
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Broadcast notification to all users of a specific role (e.g. 'student')
 */
const notifyRole = async ({ role, title, message, type = 'system', relatedId = null, link = '' }) => {
  try {
    const users = await User.find({ role }).select('_id');
    if (!users || users.length === 0) return [];

    const notifications = users.map((u) => ({
      recipient: u._id,
      title,
      message,
      type,
      relatedId,
      link,
      isRead: false
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error(`Error notifying role ${role}:`, error.message);
    return [];
  }
};

/**
 * Notify all admins (e.g., when faculty submits an event for approval)
 */
const notifyAdmins = async ({ title, message, type = 'system', relatedId = null, link = '' }) => {
  return await notifyRole({ role: 'admin', title, message, type, relatedId, link });
};

module.exports = {
  notifyUser,
  notifyRole,
  notifyAdmins
};
