import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = (await Event.find({})).toSorted({ startTime: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, isAllDay } = req.body;

    const overlappingEvent = await Event.findOne({
        $and : [
            { startTime: { $lt: new Date(endTime) } },
            { endTime: { $gt: new Date(startTime) } }
        ]
    });

    if (overlappingEvent) {
      return res.status(400).json({ message: 'Event overlaps with an existing event.' });
    }

    const event = await Event.create({ title, description, startTime, endTime, isAllDay });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } 
};