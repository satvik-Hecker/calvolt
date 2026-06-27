'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { addMonths, subMonths } from 'date-fns';

const CalendarContext = createContext<any>(null);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month'); 
  const [events, setEvents] = useState([]);
  
  // --- NEW STATE FOR THE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // -------------------------------

  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <CalendarContext.Provider 
      value={{ 
        currentDate, setCurrentDate, nextMonth, prevMonth, goToToday,
        currentView, setCurrentView, 
        events, setEvents,
        
        // --- ADD NEW STATE TO PROVIDER VALUE ---
        isModalOpen, setIsModalOpen,
        selectedDate, setSelectedDate
        // ---------------------------------------
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
export default useCalendar;