'use client';

import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { cn } from '@/lib/utils';

export default function WeekView() {
  const { currentDate, setIsModalOpen, setSelectedDate } = useCalendar();
  
  const startDate = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Header Row */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 pl-16">
        {weekDays.map((day) => (
          <div key={day.toString()} className="flex-1 flex flex-col items-center py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {format(day, 'EEE').toUpperCase()}
            </span>
            <span className={cn(
              "text-xl font-medium w-10 h-10 flex items-center justify-center rounded-full mt-1",
              isToday(day) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"
            )}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex flex-1">
        {/* Time Labels Column */}
        <div className="w-16 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {hours.map((hour) => (
            <div key={`label-${hour}`} className="h-[60px] text-right pr-2 py-2 text-xs text-gray-400 dark:text-gray-500">
              {hour === 0 ? '' : `${hour}:00`}
            </div>
          ))}
        </div>

        {/* 7-Day Columns */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day) => (
            <div key={`col-${day}`} className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 flex flex-col">
              {hours.map((hour) => (
                <div 
                  key={`${day}-${hour}`}
                  className="h-[60px] border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => {
                    setSelectedDate(day);
                    setIsModalOpen(true);
                  }}
                >
                  {/* Events will go here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}