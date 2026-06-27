'use client'; 
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MonthView from '@/components/calendar/MonthView';
import DayView from '@/components/calendar/DayView';
import WeekView from '@/components/calendar/WeekView';
import YearView from '@/components/calendar/YearView';

import { useCalendar } from '@/store/CalendarContext'; 

export default function Home() {
  const { currentView } = useCalendar(); 

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          
          {currentView === 'month' && <MonthView />}
          {currentView === 'week' && <WeekView />}
          {currentView === 'day' && <DayView />}
          {currentView === 'year' && <YearView />}
         
        </main>
      </div>
    </div>
  );
}