'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { useAuth } from '@/store/AuthContext';
import { X, Check, Clock, Calendar as CalendarIcon, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import API_BASE_URL from '@/lib/apiConfig';

const EVENT_COLORS = [
  { hex: '#4285f4', name: 'Blue' },
  { hex: '#ea4335', name: 'Red' },
  { hex: '#34a853', name: 'Green' },
  { hex: '#a142f4', name: 'Purple' },
  { hex: '#f9ab00', name: 'Yellow' },
  { hex: '#e91e8c', name: 'Pink' },
  { hex: '#ff6d01', name: 'Orange' },
  { hex: '#616161', name: 'Graphite' },
];

export default function EventModal() {
  const {
    isModalOpen,
    setIsModalOpen,
    selectedDate,
    selectedHour,
    events,
    setEvents,
    editingEvent,
    setEditingEvent,
    fetchEvents,
  } = useCalendar();
  const { token } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState('#4285f4');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Overlap confirmation
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  // Sync form with selectedDate/selectedHour/editingEvent
  useEffect(() => {
    if (!isModalOpen) return;

    if (editingEvent) {
      // Edit mode — populate form
      const start = new Date(editingEvent.startTime);
      const end = new Date(editingEvent.endTime);
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setLocation(editingEvent.location || '');
      setEventDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
      setIsAllDay(editingEvent.isAllDay);
      setColor(editingEvent.color || '#4285f4');
      setRepeat(editingEvent.repeat?.frequency || 'none');
    } else {
      // Create mode — use selected date/hour
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate(format(selectedDate, 'yyyy-MM-dd'));
      const hour = selectedHour ?? 9;
      setStartTime(`${String(hour).padStart(2, '0')}:00`);
      setEndTime(`${String(Math.min(hour + 1, 23)).padStart(2, '0')}:00`);
      setIsAllDay(false);
      setColor('#4285f4');
      setRepeat('none');
    }

    setError('');
    setOverlapWarning(null);
    setPendingPayload(null);
    setShowDeleteConfirm(false);
  }, [isModalOpen, editingEvent, selectedDate, selectedHour]);

  if (!isModalOpen) return null;

  const isEditMode = !!editingEvent;

  const buildPayload = (force = false) => {
    const startIso = isAllDay
      ? new Date(`${eventDate}T00:00:00`).toISOString()
      : new Date(`${eventDate}T${startTime}:00`).toISOString();

    const endIso = isAllDay
      ? new Date(`${eventDate}T23:59:59`).toISOString()
      : new Date(`${eventDate}T${endTime}:00`).toISOString();

    return {
      title,
      description,
      location,
      isAllDay,
      color,
      repeat: { frequency: repeat, interval: 1 },
      startTime: startIso,
      endTime: endIso,
      ...(isEditMode ? { forceUpdate: force } : { forceCreate: force }),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOverlapWarning(null);

    if (!token) {
      setError('Please log in to create events.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(false);
      const url = isEditMode
        ? `${API_BASE_URL}/api/events/${editingEvent._id}`
        : `${API_BASE_URL}/api/events`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.requiresConfirmation && data.overlapWarning) {
        // Show overlap warning — user can confirm to proceed
        setOverlapWarning(data.overlapWarning.message);
        setPendingPayload(buildPayload(true));
        setIsSubmitting(false);
        return;
      }

      if (res.ok) {
        await fetchEvents();
        handleClose();
      } else {
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('Server error while saving event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceCreate = async () => {
    if (!pendingPayload || !token) return;

    setIsSubmitting(true);
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/events/${editingEvent!._id}`
        : `${API_BASE_URL}/api/events`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingPayload),
      });

      const data = await res.json();
      if (res.ok || res.status === 201) {
        await fetchEvents();
        handleClose();
      } else {
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${editingEvent._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchEvents();
        handleClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete event');
      }
    } catch {
      setError('Server error while deleting event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setOverlapWarning(null);
    setPendingPayload(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[95%] sm:w-full sm:max-w-md max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            {isEditMode ? 'Edit Event' : 'New Event'}
          </h2>
          <div className="flex items-center gap-1">
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Are you sure you want to delete &quot;{editingEvent?.title}&quot;?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Overlap Warning */}
        {overlapWarning && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-400">{overlapWarning}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setOverlapWarning(null);
                      setPendingPayload(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleForceCreate}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Anyway'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto overflow-x-hidden flex-1 no-scrollbar">
          {error && (
            <div className="text-red-500 text-sm p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Add title"
            required
            className="w-full text-xl font-medium border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent py-1.5 transition-colors dark:text-white placeholder:text-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          {/* Date & Time Section */}
          <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <label
                  htmlFor="allDay"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  All-day
                </label>
              </div>
              <input
                type="checkbox"
                id="allDay"
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
            </div>

            {/* Date Picker */}
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" />
              <input
                type="date"
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-9 pr-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            {/* Time Pickers */}
            {!isAllDay && (
              <div className="flex gap-3 items-center">
                <input
                  type="time"
                  required
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className="text-gray-400 font-medium">–</span>
                <input
                  type="time"
                  required
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Add location"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm bg-transparent dark:text-white placeholder:text-gray-400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Repeat & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                Recurrence
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Annually</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                Event Color
              </label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110',
                      color === c.hex && 'ring-2 ring-offset-1 ring-gray-400'
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <textarea
            placeholder="Add description"
            rows={3}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm bg-transparent resize-none dark:text-white placeholder:text-gray-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}