import Event from '../models/Event.js';

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching events.', error: error.message });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      isAllDay, 
      color, 
      reminders, 
      repeat 
    } = req.body;

    // --- OVERLAP DETECTION LOGIC ---
    // Note: We generally don't want all-day events to block other specific time slots, 
    // so we can optionally skip overlap detection if isAllDay is true.
    if (!isAllDay) {
      const overlappingEvent = await Event.findOne({
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } },
          { isAllDay: false } // Only check against other time-specific events
        ]
      });

      if (overlappingEvent) {
        return res.status(400).json({ 
          message: 'Overlap detected! This event conflicts with an existing event on your calendar.' 
        });
      }
    }

    // --- SAVE THE EVENT ---
    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      color,
      reminders,
      repeat
    });

    await newEvent.save();
    res.status(201).json(newEvent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to create event.', error: error.message });
  }
};