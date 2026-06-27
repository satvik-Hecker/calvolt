'use client';

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { cn } from '@/lib/utils'; 

export default function MonthView() {
  // <-- Pull the new modal functions from context
  const { currentDate, setSelectedDate, setIsModalOpen } = useCalendar();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          return (
            <div 
              key={day.toString()}
              // <-- Add the onClick handler to update state and open the modal
              onClick={() => {
                setSelectedDate(day);
                setIsModalOpen(true);
              }}
              // <-- Added cursor-pointer so the user knows they can click
              className={cn(
                "min-h-[100px] p-1 border-r border-b border-gray-200 dark:border-gray-700 relative group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer",
                !isCurrentMonth && "bg-gray-50/50 dark:bg-gray-800/20" 
              )}
            >
              <div className="flex flex-col items-center mt-1">
                <span 
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isCurrentDay 
                      ? "bg-blue-600 text-white" 
                      : isCurrentMonth 
                        ? "text-gray-700 dark:text-gray-200" 
                        : "text-gray-400 dark:text-gray-600"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[calc(100%-32px)] no-scrollbar">
                {/* Event placeholders will go here */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}