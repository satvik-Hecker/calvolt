'use client';

import { startOfWeek, addDays, format, isToday, isSameDay } from 'date-fns';
import { useCalendar } from '@/store/CalendarContext';
import { useAuth } from '@/store/AuthContext';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types';
import { useState, useRef, useCallback } from 'react';
import API_BASE_URL from '@/lib/apiConfig';

const HOUR_HEIGHT = 60; // pixels per hour

export default function WeekView() {
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

  const startDate = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Drag & resize state
  const [dragState, setDragState] = useState<{
    eventId: string;
    type: 'move' | 'resize';
    startY: number;
    startCol: number;
    originalStart: Date;
    originalEnd: Date;
    currentTop: number;
    currentHeight: number;
    currentCol: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Get events for a specific day (timed events only)
  const getTimedEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter((event) => {
      if (event.isAllDay) return false;
      return isSameDay(new Date(event.startTime), day);
    });
  };

  // Get all-day events for the week
  const getAllDayEvents = (): CalendarEvent[] => {
    return events.filter((event) => {
      if (!event.isAllDay) return false;
      const eventStart = new Date(event.startTime);
      return weekDays.some((day) => isSameDay(eventStart, day));
    });
  };

  // Calculate position for timed events
  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 15); // min 15min display

    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: (duration / 60) * HOUR_HEIGHT,
    };
  };

  const handleCellClick = (day: Date, hour: number) => {
    setSelectedDate(day);
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

  // --- DRAG & DROP ---
  const handleMouseDown = (
    e: React.MouseEvent,
    event: CalendarEvent,
    type: 'move' | 'resize',
    colIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const pos = getEventPosition(event);
    setDragState({
      eventId: event._id,
      type,
      startY: e.clientY,
      startCol: colIndex,
      originalStart: new Date(event.startTime),
      originalEnd: new Date(event.endTime),
      currentTop: pos.top,
      currentHeight: pos.height,
      currentCol: colIndex,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState || !gridRef.current) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const colWidth = gridRect.width / 7;
      const relativeX = e.clientX - gridRect.left;
      const newCol = Math.max(0, Math.min(6, Math.floor(relativeX / colWidth)));

      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15; // snap to 15min

      if (dragState.type === 'move') {
        const origStart = dragState.originalStart;
        const origMinutes = origStart.getHours() * 60 + origStart.getMinutes();
        const newMinutes = Math.max(0, Math.min(23 * 60 + 45, origMinutes + deltaMinutes));
        const origDuration =
          dragState.originalEnd.getTime() - dragState.originalStart.getTime();
        const durationMinutes = origDuration / 60000;

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                currentTop: (newMinutes / 60) * HOUR_HEIGHT,
                currentCol: newCol,
              }
            : null
        );
      } else {
        // resize
        const origStart = dragState.originalStart;
        const origEnd = dragState.originalEnd;
        const origDurationMin =
          (origEnd.getTime() - origStart.getTime()) / 60000;
        const newDuration = Math.max(15, origDurationMin + deltaMinutes);

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                currentHeight: (newDuration / 60) * HOUR_HEIGHT,
              }
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

    const deltaY = dragState.currentTop - (dragState.originalStart.getHours() * 60 + dragState.originalStart.getMinutes()) / 60 * HOUR_HEIGHT;
    const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60);
    const colDelta = dragState.currentCol - dragState.startCol;

    let newStart: Date;
    let newEnd: Date;

    if (dragState.type === 'move') {
      const origDuration = dragState.originalEnd.getTime() - dragState.originalStart.getTime();
      newStart = addDays(new Date(dragState.originalStart.getTime() + deltaMinutes * 60000), colDelta);
      newEnd = new Date(newStart.getTime() + origDuration);
    } else {
      newStart = dragState.originalStart;
      const newDurationMinutes = (dragState.currentHeight / HOUR_HEIGHT) * 60;
      newEnd = new Date(newStart.getTime() + newDurationMinutes * 60000);
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
  }, [dragState, token, fetchEvents]);

  const allDayEvents = getAllDayEvents();

  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-x-auto no-scrollbar"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => dragState && handleMouseUp()}
    >
      <div className="min-w-[700px] flex flex-col h-full flex-1">
        {/* Header Row */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex-shrink-0">
        <div className="w-16 flex-shrink-0" />
        {weekDays.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 flex flex-col items-center py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {format(day, 'EEE').toUpperCase()}
            </span>
            <span
              className={cn(
                'text-xl font-medium w-10 h-10 flex items-center justify-center rounded-full mt-1 transition-colors',
                isToday(day)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-200'
              )}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="w-16 flex-shrink-0 text-right pr-2 py-1 text-[10px] text-gray-400">
            all-day
          </div>
          <div className="flex-1 grid grid-cols-7 gap-0.5 py-1 px-0.5">
            {weekDays.map((day) => {
              const dayAllDay = allDayEvents.filter((e) =>
                isSameDay(new Date(e.startTime), day)
              );
              return (
                <div key={day.toString()} className="flex flex-col gap-0.5">
                  {dayAllDay.map((event) => (
                    <div
                      key={event._id}
                      onClick={(e) => handleEventClick(e, event)}
                      className="text-[10px] text-white px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: event.color || '#4285f4' }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Grid */}
      <div className="flex flex-1 overflow-y-auto" ref={gridRef}>
        {/* Time Labels Column */}
        <div className="w-16 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {hours.map((hour) => (
            <div
              key={`label-${hour}`}
              className="text-right pr-2 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="relative -top-2">
                {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
              </span>
            </div>
          ))}
        </div>

        {/* 7-Day Columns */}
        <div className="flex-1 grid grid-cols-7 relative">
          {weekDays.map((day, colIndex) => {
            const dayEvents = getTimedEventsForDay(day);
            const isTodayCol = isToday(day);

            return (
              <div
                key={`col-${day}`}
                className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative"
              >
                {/* Hour slots */}
                {hours.map((hour) => (
                  <div
                    key={`${day}-${hour}`}
                    className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => handleCellClick(day, hour)}
                  />
                ))}

                {/* Current time indicator */}
                {isTodayCol && (
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
                {dayEvents.map((event) => {
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
                        'absolute left-0.5 right-1 rounded-md px-1.5 py-0.5 cursor-pointer overflow-hidden group z-10 transition-shadow border-l-4',
                        isDragging ? 'opacity-80 shadow-lg z-30' : 'hover:shadow-md'
                      )}
                      style={{
                        top: displayTop,
                        height: Math.max(displayHeight, 20),
                        backgroundColor: `${event.color || '#4285f4'}20`,
                        borderLeftColor: event.color || '#4285f4',
                      }}
                      onClick={(e) => handleEventClick(e, event)}
                      onMouseDown={(e) => handleMouseDown(e, event, 'move', colIndex)}
                    >
                      <div
                        className="text-xs font-medium truncate"
                        style={{ color: event.color || '#4285f4' }}
                      >
                        {event.title}
                      </div>
                      {displayHeight > 30 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {format(new Date(event.startTime), 'h:mm a')} -{' '}
                          {format(new Date(event.endTime), 'h:mm a')}
                        </div>
                      )}

                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          backgroundColor: event.color || '#4285f4',
                          borderRadius: '0 0 4px 4px',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, event, 'resize', colIndex);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}