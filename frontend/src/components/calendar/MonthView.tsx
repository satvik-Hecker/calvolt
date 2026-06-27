'use client';

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types';
import { useState, useRef, useCallback } from 'react';
import API_BASE_URL from '@/lib/apiConfig';
import { useAuth } from '@/store/AuthContext';

export default function MonthView() {
  const {
    currentDate,
    setSelectedDate,
    setIsModalOpen,
    events,
    setDetailEvent,
    setDetailPosition,
    setEditingEvent,
    fetchEvents,
    setSelectedHour,
  } = useCalendar();
  const { token } = useAuth();

  // Drag state for month view
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get events for a specific day
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      if (event.isAllDay) {
        return isSameDay(eventStart, day) || 
               (eventStart <= day && eventEnd >= day);
      }
      return isSameDay(eventStart, day);
    });
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDetailEvent(event);
    setDetailPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4,
    });
  };

  const handleCellClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedHour(null);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event._id);
  };

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(day);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    setDragOverDate(null);

    if (!draggedEvent || !token) return;

    const oldStart = new Date(draggedEvent.startTime);
    const oldEnd = new Date(draggedEvent.endTime);
    const duration = oldEnd.getTime() - oldStart.getTime();

    // Keep the same time, just change the date
    const newStart = new Date(day);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + duration);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${draggedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          forceUpdate: true,
        }),
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to move event:', error);
    }

    setDraggedEvent(null);
  };

  // Color mapping for event display
  const getEventStyle = (color: string) => ({
    backgroundColor: color || '#4285f4',
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-x-auto no-scrollbar">
      <div className="min-w-[700px] flex flex-col h-full flex-1">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);
          const dayEvents = getEventsForDay(day);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;
          const isDragOver = dragOverDate && isSameDay(dragOverDate, day);

          return (
            <div
              key={day.toString()}
              onClick={() => handleCellClick(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                'min-h-[100px] p-1 border-r border-b border-gray-200 dark:border-gray-700 relative group transition-colors cursor-pointer',
                !isCurrentMonth && 'bg-gray-50/50 dark:bg-gray-800/20',
                isCurrentMonth && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                isDragOver && 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset'
              )}
            >
              {/* Date number */}
              <div className="flex flex-col items-center mt-1">
                <span
                  className={cn(
                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                    isCurrentDay
                      ? 'bg-blue-600 text-white'
                      : isCurrentMonth
                        ? 'text-gray-700 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-600'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden max-h-[calc(100%-36px)]">
                {visibleEvents.map((event) => (
                  <div
                    key={event._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={(e) => handleEventClick(e, event)}
                    className="text-[10px] sm:text-xs text-white px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90 transition-opacity select-none"
                    style={getEventStyle(event.color)}
                    title={event.title}
                  >
                    {!event.isAllDay && (
                      <span className="opacity-80 mr-1">
                        {format(new Date(event.startTime), 'h:mm a')}
                      </span>
                    )}
                    {event.title}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-1.5 font-medium">
                    +{overflowCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}