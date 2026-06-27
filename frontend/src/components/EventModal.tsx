'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { X, Check, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventModal() {
  const { isModalOpen, setIsModalOpen, selectedDate, setEvents } = useCalendar();
  
  // --- CORE STATE ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Initialize local date string for the native HTML date picker
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  // --- ADVANCED STATE ---
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState('bg-blue-600');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');

  const availableColors = [
    'bg-blue-600', 'bg-red-500', 'bg-green-500', 
    'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'
  ];

  // Sync the modal's date picker with whatever day the user clicked on the grid
  useEffect(() => {
    if (isModalOpen && selectedDate) {
      setEventDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [isModalOpen, selectedDate]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Use the localized eventDate from the form, NOT the global selectedDate
    const startIso = isAllDay 
      ? new Date(`${eventDate}T00:00:00`).toISOString() 
      : new Date(`${eventDate}T${startTime}:00`).toISOString();
      
    const endIso = isAllDay 
      ? new Date(`${eventDate}T23:59:59`).toISOString() 
      : new Date(`${eventDate}T${endTime}:00`).toISOString();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          description,
          isAllDay,
          color,
          repeat: { frequency: repeat, interval: 1 },
          startTime: startIso,
          endTime: endIso,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEvents((prev: any) => [...prev, data]);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch (err) {
      setError('Server error while saving event.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">New Event</h2>
          <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">{error}</div>}
          
          <div>
            <input 
              type="text" 
              placeholder="Add title" 
              required
              className="w-full text-2xl font-medium border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent py-1 transition-colors dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* --- DATE & TIME SECTION --- */}
          <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            
            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <label htmlFor="allDay" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  All-day
                </label>
              </div>
              <input 
                type="checkbox" 
                id="allDay"
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" />
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-9 pr-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Time Pickers (Hidden if All Day is checked) */}
            {!isAllDay && (
              <div className="flex gap-3 transition-all">
                <div className="flex-1">
                  <input 
                    type="time" 
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <span className="flex items-center text-gray-400">-</span>
                <div className="flex-1">
                  <input 
                    type="time" 
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          {/* --------------------------- */}

          <div className="grid grid-cols-2 gap-4">
            {/* Repeat Dropdown */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Recurrence</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-transparent dark:text-white cursor-pointer"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Annually</option>
              </select>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Event Color</label>
              <div className="flex gap-2 mt-1">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                      c
                    )}
                  >
                    {color === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <textarea 
              placeholder="Add description"
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-transparent resize-none dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}