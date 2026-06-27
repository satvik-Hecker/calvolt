'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from 'date-fns';

export type CalendarView = 'day' | 'week' | 'month' | 'year';

interface CalendarContextType {
  // Date state
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;

  // View state
  currentView: CalendarView;
  setCurrentView: React.Dispatch<
    React.SetStateAction<CalendarView>
  >;

  // Navigation
  nextPeriod: () => void;
  prevPeriod: () => void;
  goToToday: () => void;

  // Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  toggleSidebar: () => void;

  // Modal state
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  // Selected date
  selectedDate: Date;
  setSelectedDate: React.Dispatch<
    React.SetStateAction<Date>
  >;

  // Events (can strongly type later)
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
}

const CalendarContext =
  createContext<CalendarContextType | null>(null);

export const CalendarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Current displayed date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Current calendar view
  const [currentView, setCurrentView] =
    useState<CalendarView>('month');

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Event modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected date
  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );

  // Events
  const [events, setEvents] = useState<any[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Navigation
  const nextPeriod = () => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'day':
          return addDays(prev, 1);

        case 'week':
          return addWeeks(prev, 1);

        case 'month':
          return addMonths(prev, 1);

        case 'year':
          return addYears(prev, 1);

        default:
          return prev;
      }
    });
  };

  const prevPeriod = () => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'day':
          return subDays(prev, 1);

        case 'week':
          return subWeeks(prev, 1);

        case 'month':
          return subMonths(prev, 1);

        case 'year':
          return subYears(prev, 1);

        default:
          return prev;
      }
    });
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,

        currentView,
        setCurrentView,

        nextPeriod,
        prevPeriod,
        goToToday,

        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,

        isModalOpen,
        setIsModalOpen,

        selectedDate,
        setSelectedDate,

        events,
        setEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error(
      'useCalendar must be used within CalendarProvider'
    );
  }

  return context;
};

export default useCalendar;