import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the event'],
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
      required: [true, 'Please add a start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please add an end time'],
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

// Pre-save middleware to prevent logical time errors
eventSchema.pre('save', function (next) {
  // Edge Case: Ensure end time is strictly after start time
  if (this.startTime >= this.endTime) {
    return next(new Error('End time must be strictly after start time.'));
  }
  
});

const Event = mongoose.model('Event', eventSchema);
export default Event;