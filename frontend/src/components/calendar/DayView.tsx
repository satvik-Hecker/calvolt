'use client';

import { format, isToday, isSameDay } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { useAuth } from '@/store/AuthContext';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types';
import { useState, useRef, useCallback } from 'react';
import API_BASE_URL from '@/lib/apiConfig';

const HOUR_HEIGHT = 60;

export default function DayView() {
  const {
    currentDate,
    setIsModalOpen,
    setSelectedDate,
    setSelectedHour,
    events,
    setDetailEvent,
    setDetailPosition,
    setEditingEvent,
    fetchEvents,
  } = useCalendar();
  const { token } = useAuth();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const isTodayDate = isToday(currentDate);

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Drag & resize state
  const [dragState, setDragState] = useState<{
    eventId: string;
    type: 'move' | 'resize';
    startY: number;
    originalStart: Date;
    originalEnd: Date;
    currentTop: number;
    currentHeight: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Get timed events for current day
  const timedEvents = events.filter((event) => {
    if (event.isAllDay) return false;
    return isSameDay(new Date(event.startTime), currentDate);
  });

  // Get all-day events
  const allDayEvents = events.filter((event) => {
    if (!event.isAllDay) return false;
    return isSameDay(new Date(event.startTime), currentDate);
  });

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 15);

    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: (duration / 60) * HOUR_HEIGHT,
    };
  };

  const handleCellClick = (hour: number) => {
    setSelectedDate(currentDate);
    setSelectedHour(hour);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDetailEvent(event);
    setDetailPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  // --- DRAG & RESIZE ---
  const handleMouseDown = (
    e: React.MouseEvent,
    event: CalendarEvent,
    type: 'move' | 'resize'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const pos = getEventPosition(event);
    setDragState({
      eventId: event._id,
      type,
      startY: e.clientY,
      originalStart: new Date(event.startTime),
      originalEnd: new Date(event.endTime),
      currentTop: pos.top,
      currentHeight: pos.height,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState) return;

      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;

      if (dragState.type === 'move') {
        const origMinutes =
          dragState.originalStart.getHours() * 60 +
          dragState.originalStart.getMinutes();
        const newMinutes = Math.max(0, Math.min(23 * 60 + 45, origMinutes + deltaMinutes));

        setDragState((prev) =>
          prev
            ? { ...prev, currentTop: (newMinutes / 60) * HOUR_HEIGHT }
            : null
        );
      } else {
        const origDuration =
          (dragState.originalEnd.getTime() - dragState.originalStart.getTime()) / 60000;
        const newDuration = Math.max(15, origDuration + deltaMinutes);

        setDragState((prev) =>
          prev
            ? { ...prev, currentHeight: (newDuration / 60) * HOUR_HEIGHT }
            : null
        );
      }
    },
    [dragState]
  );

  const handleMouseUp = useCallback(async () => {
    if (!dragState || !token) {
      setDragState(null);
      return;
    }

    let newStart: Date;
    let newEnd: Date;

    if (dragState.type === 'move') {
      const newTopMinutes = (dragState.currentTop / HOUR_HEIGHT) * 60;
      const duration = dragState.originalEnd.getTime() - dragState.originalStart.getTime();
      newStart = new Date(currentDate);
      newStart.setHours(Math.floor(newTopMinutes / 60), newTopMinutes % 60, 0, 0);
      newEnd = new Date(newStart.getTime() + duration);
    } else {
      newStart = dragState.originalStart;
      const newDurationMin = (dragState.currentHeight / HOUR_HEIGHT) * 60;
      newEnd = new Date(newStart.getTime() + newDurationMin * 60000);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${dragState.eventId}`, {
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
      console.error('Failed to update event:', error);
    }

    setDragState(null);
  }, [dragState, token, fetchEvents, currentDate]);

  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => dragState && handleMouseUp()}
    >
      {/* Header */}
      <div className="flex flex-col items-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {format(currentDate, 'EEEE').toUpperCase()}
        </span>
        <span
          className={cn(
            'text-2xl font-medium w-12 h-12 flex items-center justify-center rounded-full mt-1 transition-colors',
            isTodayDate
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-200'
          )}
        >
          {format(currentDate, 'd')}
        </span>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="w-16 flex-shrink-0 text-right pr-2 py-1 text-[10px] text-gray-400">
            all-day
          </div>
          <div className="flex-1 flex flex-wrap gap-1 py-1 px-1">
            {allDayEvents.map((event) => (
              <div
                key={event._id}
                onClick={(e) => handleEventClick(e, event)}
                className="text-xs text-white px-2 py-0.5 rounded cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: event.color || '#4285f4' }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto" ref={gridRef}>
        <div className="flex relative">
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
            {hours.map((hour) => (
              <div
                key={hour}
                className="text-right pr-3 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-2">
                  {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Event Column */}
          <div className="flex-1 relative">
            {/* Hour slots */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                style={{ height: HOUR_HEIGHT }}
                onClick={() => handleCellClick(hour)}
              />
            ))}

            {/* Current time indicator */}
            {isTodayDate && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: (currentMinutes / 60) * HOUR_HEIGHT }}
              >
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </div>
              </div>
            )}

            {/* Events */}
            {timedEvents.map((event) => {
              const pos = getEventPosition(event);
              const isDragging = dragState?.eventId === event._id;

              const displayTop =
                isDragging && dragState?.type === 'move'
                  ? dragState.currentTop
                  : pos.top;
              const displayHeight =
                isDragging && dragState?.type === 'resize'
                  ? dragState.currentHeight
                  : pos.height;

              return (
                <div
                  key={event._id}
                  className={cn(
                    'absolute left-1 right-4 rounded-md px-2 py-1 cursor-pointer overflow-hidden group z-10 transition-shadow border-l-4',
                    isDragging ? 'opacity-80 shadow-lg z-30' : 'hover:shadow-md'
                  )}
                  style={{
                    top: displayTop,
                    height: Math.max(displayHeight, 20),
                    backgroundColor: `${event.color || '#4285f4'}20`,
                    borderLeftColor: event.color || '#4285f4',
                  }}
                  onClick={(e) => handleEventClick(e, event)}
                  onMouseDown={(e) => handleMouseDown(e, event, 'move')}
                >
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: event.color || '#4285f4' }}
                  >
                    {event.title}
                  </div>
                  {displayHeight > 35 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(event.startTime), 'h:mm a')} –{' '}
                      {format(new Date(event.endTime), 'h:mm a')}
                    </div>
                  )}
                  {displayHeight > 55 && event.location && (
                    <div className="text-xs text-gray-400 mt-0.5 truncate">
                      📍 {event.location}
                    </div>
                  )}

                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-b"
                    style={{ backgroundColor: event.color || '#4285f4' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, event, 'resize');
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}