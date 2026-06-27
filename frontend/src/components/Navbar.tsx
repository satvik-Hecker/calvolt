
'use client';

import { Menu, Search, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDate } from 'date-fns';
import useCalendar from '@/store/CalendarContext';

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
    nextMonth,
    prevMonth,
    goToToday,
    currentView,
    setCurrentView,
  } = useCalendar();

  const todayDayNumber = getDate(new Date());

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          {/* Dynamic Date Icon */}
          <div className="flex h-8 w-8 flex-col overflow-hidden rounded border border-gray-300 bg-white shadow-sm dark:border-gray-600">
            <div className="h-2.5 w-full bg-blue-600" />
            <div className="flex flex-1 items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
              {todayDayNumber}
            </div>
          </div>

          <span className="hidden text-xl font-normal text-gray-700 dark:text-gray-200 sm:block">
            CalVolt
          </span>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div className="flex flex-1 items-center justify-center gap-1 sm:gap-3">
        <button
          onClick={goToToday}
          className="hidden rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:block "
        >
          Today
        </button>

        <button
          onClick={prevMonth}
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <h2 className="min-w-[110px] text-center text-base font-medium text-gray-700 dark:text-gray-200 sm:min-w-[180px] sm:text-xl">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={nextMonth}
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search - hidden on mobile */}
        <button className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:flex">
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Help - hidden on mobile */}
        <button className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:flex">
          <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* View Switcher */}
        <Select
          value={currentView || 'month'}
          onValueChange={(value) => setCurrentView(value)}
        >
          <SelectTrigger className="h-9 w-[110px] rounded-full border-gray-300 text-sm dark:border-gray-700 sm:w-[140px]">
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

        {/* User Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-img.jpg" alt="User avatar" />
          <AvatarFallback>TT</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

