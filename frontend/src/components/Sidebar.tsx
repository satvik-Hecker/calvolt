'use client';

import { useState, useEffect } from 'react';
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
    setEditingEvent,
    setSelectedHour,
    isSidebarOpen,
    setIsSidebarOpen,
    events,
  } = useCalendar();

  const [miniMonth, setMiniMonth] = useState(currentDate);

  // Sync mini calendar when main calendar navigates
  useEffect(() => {
    setMiniMonth(currentDate);
  }, [currentDate]);

  const monthStart = startOfMonth(miniMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const miniDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Check if a day has events
  const dayHasEvents = (day: Date) => {
    return events.some((event) => isSameDay(new Date(event.startTime), day));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:block border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 border-r-0'
        )}
      >
      {isSidebarOpen && (
        <div className="h-[calc(100vh-65px)] overflow-y-auto no-scrollbar">
          {/* Create Button */}
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedHour(null);
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <span className="pr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Create
            </span>
          </button>

          {/* Mini Calendar */}
          <div className="mb-8">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {format(miniMonth, 'MMMM yyyy')}
              </h2>

              <div className="flex gap-1">
                <button
                  onClick={() => setMiniMonth(subMonths(miniMonth, 1))}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => setMiniMonth(addMonths(miniMonth, 1))}
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
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, currentDate);
                const isTodayDate = isToday(day);
                const hasEvents = isCurrentMonth && dayHasEvents(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setSelectedDate(day);
                    }}
                    className={cn(
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors relative',

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
                    {/* Event indicator */}
                    {hasEvents && !isTodayDate && !isSelected && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Calendars Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
              My Calendars
            </h3>
            <div className="space-y-1.5">
              {[
                { name: 'Personal', color: '#4285f4' },
                { name: 'Work', color: '#ea4335' },
                { name: 'Reminders', color: '#34a853' },
              ].map((cal) => (
                <label
                  key={cal.name}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: cal.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {cal.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}