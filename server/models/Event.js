const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select an event category'],
      enum: {
        values: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'],
        message: 'Invalid event category'
      }
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 10:00 AM)']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (e.g. 01:00 PM)']
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue or hall name'],
      trim: true
    },
    organizer: {
      type: String,
      required: [true, 'Please specify the organizing department or club'],
      trim: true
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Please specify maximum participants capacity'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative']
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please provide registration deadline date']
    },
    status: {
      type: String,
      enum: {
        values: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        message: 'Invalid status'
      },
      default: 'Upcoming'
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Invalid approval status'
      },
      default: 'Approved' // For admin default, overridden to Pending for faculty in controller
    },
    rejectionReason: {
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

// Virtual for capacity percentage
eventSchema.virtual('isFull').get(function () {
  return this.registeredCount >= this.maxParticipants;
});

// Configure JSON serialization to include virtuals
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
