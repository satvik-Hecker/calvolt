'use client';

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';

import { useCalendar } from '@/store/CalendarContext';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const {
    currentDate,
    setCurrentDate,
    setSelectedDate,
    setIsModalOpen,
    isSidebarOpen,
  } = useCalendar();

  const [miniMonth, setMiniMonth] = useState(currentDate);

  const monthStart = startOfMonth(miniMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const miniDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <aside
      className={cn(
        'hidden md:block border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ease-in-out',
        isSidebarOpen
          ? 'w-64 p-4'
          : 'w-0 p-0 border-r-0'
      )}
    >
      {/* Prevent rendering content when collapsed */}
      {isSidebarOpen && (
        <div className="h-[calc(100vh-65px)] overflow-y-auto no-scrollbar">
          {/* Create Button */}
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="mb-6 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <Plus className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <span className="pr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Create
            </span>
          </button>

          {/* Mini Calendar */}
          <div className="mb-8">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {format(miniMonth, 'MMMM yyyy')}
              </h2>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setMiniMonth(subMonths(miniMonth, 1))
                  }
                  className="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() =>
                    setMiniMonth(addMonths(miniMonth, 1))
                  }
                  className="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-1 grid grid-cols-7 gap-y-1">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500"
                >
                  {day}
                </div>
              ))}

              {miniDays.map((day) => {
                const isCurrentMonth = isSameMonth(
                  day,
                  monthStart
                );

                const isSelected = isSameDay(
                  day,
                  currentDate
                );

                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setSelectedDate(day);
                      setMiniMonth(day);
                    }}
                    className={cn(
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',

                      !isCurrentMonth &&
                        'text-gray-300 dark:text-gray-600',

                      isCurrentMonth &&
                        !isSelected &&
                        !isTodayDate &&
                        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',

                      isSelected &&
                        !isTodayDate &&
                        'bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',

                      isTodayDate &&
                        'bg-blue-600 font-bold text-white'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}