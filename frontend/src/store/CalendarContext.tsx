'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

import { CalendarEvent } from '@/lib/types';
import { useAuth } from '@/store/AuthContext';
import API_BASE_URL from '@/lib/apiConfig';

export type CalendarView = 'day' | 'week' | 'month' | 'year';

interface CalendarContextType {
  // Date state
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;

  // View state
  currentView: CalendarView;
  setCurrentView: React.Dispatch<React.SetStateAction<CalendarView>>;

  // Navigation
  nextPeriod: () => void;
  prevPeriod: () => void;
  goToToday: () => void;

  // Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Modal state
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Selected date (for creating events)
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;

  // Selected hour (when clicking a time slot)
  selectedHour: number | null;
  setSelectedHour: React.Dispatch<React.SetStateAction<number | null>>;

  // Events
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  fetchEvents: () => Promise<void>;
  isLoadingEvents: boolean;

  // Edit mode
  editingEvent: CalendarEvent | null;
  setEditingEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;

  // Detail popover
  detailEvent: CalendarEvent | null;
  setDetailEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  detailPosition: { x: number; y: number } | null;
  setDetailPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();

  // Current displayed date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Current calendar view
  const [currentView, setCurrentView] = useState<CalendarView>('month');

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Event modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected date & hour
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Edit mode
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Detail popover
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [detailPosition, setDetailPosition] = useState<{ x: number; y: number } | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Navigation
  const nextPeriod = () => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'day': return addDays(prev, 1);
        case 'week': return addWeeks(prev, 1);
        case 'month': return addMonths(prev, 1);
        case 'year': return addYears(prev, 1);
        default: return prev;
      }
    });
  };

  const prevPeriod = () => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'day': return subDays(prev, 1);
        case 'week': return subWeeks(prev, 1);
        case 'month': return subMonths(prev, 1);
        case 'year': return subYears(prev, 1);
        default: return prev;
      }
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    if (!token) return;

    setIsLoadingEvents(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [token]);

  // Fetch events on mount and when token changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

        selectedHour,
        setSelectedHour,

        events,
        setEvents,
        fetchEvents,
        isLoadingEvents,

        editingEvent,
        setEditingEvent,

        detailEvent,
        setDetailEvent,
        detailPosition,
        setDetailPosition,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return context;
};

export default useCalendar;