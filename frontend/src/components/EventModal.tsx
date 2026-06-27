'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { X } from 'lucide-react';

export default function EventModal() {
  const { isModalOpen, setIsModalOpen, selectedDate } = useCalendar();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Default times for the form
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Construct the full UTC ISO strings for the backend
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startIso = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const endIso = new Date(`${dateStr}T${endTime}:00`).toISOString();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Assuming you secured the events route!
        },
        body: JSON.stringify({
          title,
          description,
          startTime: startIso,
          endTime: endIso,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        // We will add logic to refresh the events list here later!
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
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">New Event</h2>
          <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}
          
          <div>
            <input 
              type="text" 
              placeholder="Add title" 
              required
              className="w-full text-xl font-medium border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent py-1 transition-colors dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
              <input 
                type="time" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-transparent dark:text-white"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">End Time</label>
              <input 
                type="time" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-transparent dark:text-white"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea 
              placeholder="Add description"
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-transparent resize-none dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}