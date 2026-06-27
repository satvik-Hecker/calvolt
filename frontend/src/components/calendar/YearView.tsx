'use client';

import { 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
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

export default function YearView() {
  const { currentDate, setSelectedDate, setCurrentView } = useCalendar();

  // 1. Get all 12 months of the currently selected year
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
        {months.map((month) => {
          // 2. Date math for each specific mini-month
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(monthStart);
          const startDate = startOfWeek(monthStart);
          const endDate = endOfWeek(monthEnd);

          const days = eachDayOfInterval({ start: startDate, end: endDate });

          return (
            <div key={month.toString()} className="flex flex-col">
              {/* Month Title */}
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 ml-2">
                {format(month, 'MMMM')}
              </h3>

              {/* Mini Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Mini Days Grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isCurrentDay = isToday(day);

                  return (
                    <div 
                      key={day.toString()} 
                      className="flex justify-center items-center h-8"
                    >
                      <button
                        onClick={() => {
                          // Clicking a day in Year View jumps you to that specific Day View
                          setSelectedDate(day);
                          setCurrentView('day');
                        }}
                        disabled={!isCurrentMonth}
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors",
                          !isCurrentMonth ? "opacity-0 cursor-default" : "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-300",
                          isCurrentDay && isCurrentMonth && "bg-blue-600 hover:bg-blue-700 text-white dark:text-white"
                        )}
                      >
                        {isCurrentMonth ? format(day, 'd') : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}