'use client';

import {
  Menu,
  Search,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from 'lucide-react';

import { format, getDate } from 'date-fns';
import useCalendar from '@/store/CalendarContext';
import { useAuth } from '@/store/AuthContext';
import { useState, useRef, useEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

export default function Navbar() {
  const {
    currentDate,
    nextPeriod,
    prevPeriod,
    goToToday,
    currentView,
    setCurrentView,
    toggleSidebar,
  } = useCalendar();
  const { user, logout, isAuthenticated } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const todayDayNumber = getDate(new Date());

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic heading
  const getHeaderText = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'dd MMMM yyyy');
      case 'week':
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 sm:px-4 dark:border-gray-800 dark:bg-gray-900">
      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex min-w-47 items-center gap-2 sm:gap-4">
          {/* Calendar Icon */}
          <div className="flex h-10 w-10 flex-col overflow-hidden rounded border border-gray-300 bg-white shadow-sm dark:border-gray-600">
            <div className="h-2.5 w-full bg-blue-600" />
            <div className="flex flex-1 items-center justify-center text-base font-bold text-gray-700 dark:text-gray-200">
              {todayDayNumber}
            </div>
          </div>

          <span className="hidden text-xl font-normal text-gray-700 sm:block dark:text-gray-200">
            CalVolt
          </span>
        </div>
      </div>

      {/* Today Button */}
      <div className="hidden sm:block">
        <button
          onClick={goToToday}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Today
        </button>
      </div>

      {/* CENTER SECTION */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-3">
        <button
          onClick={prevPeriod}
          className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <h2 className="truncate px-1 text-center text-sm font-medium text-gray-700 sm:min-w-[180px] sm:text-xl dark:text-gray-200">
          {getHeaderText()}
        </h2>

        <button
          onClick={nextPeriod}
          className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* Search */}
        <button className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 md:flex dark:hover:bg-gray-800">
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Help */}
        <button className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 md:flex dark:hover:bg-gray-800">
          <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* View Switcher */}
        <Select
          value={currentView || 'month'}
          onValueChange={(value) => setCurrentView(value as typeof currentView)}
        >
          <SelectTrigger className="h-9 w-[90px] rounded-full border-gray-300 text-xs sm:w-[130px] sm:text-sm dark:border-gray-700">
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            position="popper"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <SelectGroup>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* User Avatar with Dropdown */}
        {isAuthenticated && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="rounded-full transition-all hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-700"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || 'User'} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}