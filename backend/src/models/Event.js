import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
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
    default: 'bg-blue-600' 
    },
    reminders: [{ 
    type: Number // Array of minutes before the event 
    }],
    isAllDay: {
      type: Boolean,
      default: false,
    },
    repeat: {
    frequency: { 
      type: String, 
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], 
      default: 'none' 
    },
    interval: { 
      type: Number, 
      default: 1 
    },
    endDate: { 
      type: Date 
    }
  }
  },
  {
    timestamps: true, 
  }
);

// Pre-save middleware to prevent logical time errors
eventSchema.pre('save', async function () {
  // Ensure end time is strictly after start time
  if (this.endTime <= this.startTime) {
    throw new Error('End time must be after start time.');
  }
  
  // Ensure recurring end date is after the event start time
  if (this.repeat.frequency !== 'none' && this.repeat.endDate) {
    if (this.repeat.endDate <= this.startTime) {
      throw new Error('Recurring end date must be after the event start time.');
    }
  }
  
  return;
});

const Event = mongoose.model('Event', eventSchema);
export default Event;