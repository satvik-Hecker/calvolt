'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { addMonths, subMonths } from 'date-fns';

// Create the context
const CalendarContext = createContext<any>(null);

// Create the provider component
export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  // 1. Track the date the user is currently viewing
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 2. Track the current calendar view ('month', 'week', 'day', 'year')
  const [currentView, setCurrentView] = useState('month'); 
  
  // 3. Track the list of events loaded from the backend
  const [events, setEvents] = useState([]);

  // Navigation helpers using date-fns
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <CalendarContext.Provider 
      value={{ 
        // Date state & functions
        currentDate, 
        setCurrentDate,
        nextMonth, 
        prevMonth, 
        goToToday,
        
        // View state
        currentView, 
        setCurrentView, 
        
        // Event state
        events, 
        setEvents 
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook to easily use this context in any component
const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export default useCalendar;