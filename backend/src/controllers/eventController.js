import Event from '../models/Event.js';

/**
 * GET /api/events
 * Fetch all events for the authenticated user.
 * Supports optional ?start=ISO&end=ISO query params for date-range filtering.
 */
export const getEvents = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    // Optional date-range filtering
    const { start, end } = req.query;
    if (start && end) {
      filter.$or = [
        // Events that overlap with the requested range
        { startTime: { $lt: new Date(end) }, endTime: { $gt: new Date(start) } },
        // Recurring events that started before the range end
        { 'repeat.frequency': { $ne: 'none' }, startTime: { $lte: new Date(end) } },
      ];
    }

    const events = await Event.find(filter).sort({ startTime: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching events.', error: error.message });
  }
};

/**
 * GET /api/events/:id
 * Fetch a single event by ID (ownership verified).
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/**
 * POST /api/events
 * Create a new event for the authenticated user.
 * Returns overlap warning (not blocking) if a conflict is detected.
 */
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      color,
      reminders,
      repeat,
      forceCreate, // client sends true to bypass overlap warning
    } = req.body;

    // --- OVERLAP DETECTION (warning, not blocking) ---
    let overlapWarning = null;
    if (!isAllDay && !forceCreate) {
      const overlappingEvent = await Event.findOne({
        userId: req.user._id,
        isAllDay: false,
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) },
      });

      if (overlappingEvent) {
        overlapWarning = {
          message: `This event overlaps with "${overlappingEvent.title}".`,
          conflictingEvent: {
            _id: overlappingEvent._id,
            title: overlappingEvent.title,
            startTime: overlappingEvent.startTime,
            endTime: overlappingEvent.endTime,
          },
        };

        // Return the warning — client must re-send with forceCreate: true to proceed
        return res.status(200).json({
          requiresConfirmation: true,
          overlapWarning,
        });
      }
    }

    // --- SAVE THE EVENT ---
    const newEvent = new Event({
      userId: req.user._id,
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      color,
      reminders,
      repeat,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event.', error: error.message });
  }
};

/**
 * PUT /api/events/:id
 * Update an existing event (ownership verified).
 */
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      color,
      reminders,
      repeat,
      forceUpdate,
    } = req.body;

    // Overlap detection for updates (exclude the current event)
    if (!isAllDay && !forceUpdate && startTime && endTime) {
      const overlappingEvent = await Event.findOne({
        userId: req.user._id,
        _id: { $ne: event._id },
        isAllDay: false,
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) },
      });

      if (overlappingEvent) {
        return res.status(200).json({
          requiresConfirmation: true,
          overlapWarning: {
            message: `This event overlaps with "${overlappingEvent.title}".`,
            conflictingEvent: {
              _id: overlappingEvent._id,
              title: overlappingEvent.title,
              startTime: overlappingEvent.startTime,
              endTime: overlappingEvent.endTime,
            },
          },
        });
      }
    }

    // Apply updates
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (isAllDay !== undefined) event.isAllDay = isAllDay;
    if (color !== undefined) event.color = color;
    if (reminders !== undefined) event.reminders = reminders;
    if (repeat !== undefined) event.repeat = repeat;

    await event.save(); // triggers pre-save validation
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event.', error: error.message });
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event (ownership verified).
 */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({ message: 'Event deleted successfully.', _id: event._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event.', error: error.message });
  }
};