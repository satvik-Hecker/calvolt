import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxLength: [500, 'Location cannot exceed 500 characters'],
      default: '',
    },
    startTime: {
      type: Date,
      required: [true, 'Event start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Event end time is required'],
    },
    color: {
      type: String,
      default: '#4285f4', // Google Calendar blue
    },
    reminders: [{
      type: Number, // Array of minutes before the event
    }],
    isAllDay: {
      type: Boolean,
      default: false,
    },
    repeat: {
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'none',
      },
      interval: {
        type: Number,
        default: 1,
      },
      endDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient date-range queries per user
eventSchema.index({ userId: 1, startTime: 1, endTime: 1 });

// Pre-save middleware to prevent logical time errors
eventSchema.pre('save', async function () {
  if (this.endTime <= this.startTime) {
    throw new Error('End time must be after start time.');
  }

  if (this.repeat.frequency !== 'none' && this.repeat.endDate) {
    if (this.repeat.endDate <= this.startTime) {
      throw new Error('Recurring end date must be after the event start time.');
    }
  }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;