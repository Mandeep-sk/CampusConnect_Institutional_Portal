const Notice = require('../models/Notice');
const { notifyRole } = require('../utils/notificationHelper');

// @desc    Get all notices with filters & search
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res, next) => {
  try {
    const { category, priority, search, myNotices } = req.query;
    let query = {};

    // Filter my notices (for faculty/admin)
    if (myNotices === 'true' && req.user) {
      query.createdBy = req.user.id;
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (priority && priority !== 'All' && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name email department role avatar')
      .sort({ publishedDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name email department role avatar');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.status(200).json({
      success: true,
      notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Faculty or Admin)
const createNotice = async (req, res, next) => {
  try {
    const { title, description, category, priority, expiryDate, attachmentUrl } = req.body;

    const notice = await Notice.create({
      title,
      description,
      category: category || 'General',
      priority: priority || 'Normal',
      expiryDate: expiryDate || undefined,
      attachmentUrl: attachmentUrl || '',
      createdBy: req.user.id
    });

    // Notify students of new notice
    const isUrgent = notice.priority === 'Urgent';
    await notifyRole({
      role: 'student',
      title: `${isUrgent ? '🚨 URGENT NOTICE: ' : 'New Notice: '}${notice.title}`,
      message: `${req.user.name} posted a notice under [${notice.category}]: ${notice.title}`,
      type: 'notice_created',
      relatedId: notice._id,
      link: `/notices/${notice._id}`
    });

    // If urgent, also notify faculty
    if (isUrgent) {
      await notifyRole({
        role: 'faculty',
        title: `🚨 URGENT INSTITUTIONAL NOTICE: ${notice.title}`,
        message: `${notice.title} - Please review immediately.`,
        type: 'notice_created',
        relatedId: notice._id,
        link: `/notices/${notice._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notice published successfully to the campus notice board',
      notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin or Faculty creator)
const updateNotice = async (req, res, next) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    if (req.user.role !== 'admin' && notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this notice'
      });
    }

    notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin or Faculty creator)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    if (req.user.role !== 'admin' && notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this notice'
      });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Notice '${notice.title}' deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
};
