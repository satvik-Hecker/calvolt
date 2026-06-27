'use client';

import { format } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';

export default function DayView() {
  const { currentDate, setIsModalOpen, setSelectedDate } = useCalendar();
  
  // Generate an array from 0 to 23 for our hours
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {format(currentDate, 'EEE').toUpperCase()}
        </span>
        <span className="text-2xl font-medium w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white mt-1">
          {format(currentDate, 'd')}
        </span>
      </div>

      {/* Time Grid */}
      <div className="flex-1 relative">
        {hours.map((hour) => (
          <div key={hour} className="flex min-h-[60px] border-b border-gray-100 dark:border-gray-800">
            {/* Time Label */}
            <div className="w-16 text-right pr-4 py-2 text-xs text-gray-400 dark:text-gray-500">
              {hour === 0 ? '' : `${hour}:00`}
            </div>
            
            {/* Clickable Time Slot */}
            <div 
              className="flex-1 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => {
                // We'll pass the exact hour they clicked later, for now just open the modal
                setSelectedDate(currentDate);
                setIsModalOpen(true);
              }}
            >
              {/* Events for this specific hour will be absolutely positioned here later */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}