'use client';

import useCalendar from '@/store/CalendarContext';

import MonthView from './calendar/MonthView';
import WeekView from './calendar/WeekView';
import YearView from './calendar/YearView';
import DayView from './calendar/DayView';

export default function CalendarView() {
  const { currentView } = useCalendar();

  switch (currentView) {
    case 'day':
      return <DayView />;

    case 'week':
      return <WeekView />;

    case 'year':
      return <YearView />;

    case 'month':
    default:
      return <MonthView />;
  }
}