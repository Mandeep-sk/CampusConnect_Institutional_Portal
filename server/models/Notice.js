const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide notice title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide notice content/description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a notice category'],
      enum: {
        values: ['Academic', 'Examination', 'Admissions', 'Placement', 'Sports', 'General', 'Events'],
        message: 'Invalid notice category'
      },
      default: 'General'
    },
    priority: {
      type: String,
      enum: {
        values: ['Normal', 'Important', 'Urgent'],
        message: 'Priority must be Normal, Important, or Urgent'
      },
      default: 'Normal'
    },
    publishedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    },
    attachmentUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
