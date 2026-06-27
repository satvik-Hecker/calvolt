'use client';

import { Menu, Search, HelpCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { format, getDate } from 'date-fns';
import useCalendar from '@/store/CalendarContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Navbar() {
  const { 
    currentDate, 
    nextMonth, 
    prevMonth, 
    goToToday,
    currentView,
    setCurrentView 
  } = useCalendar(); 

  // Get just the current day number (e.g., "27") for our dynamic icon
  const todayDayNumber = getDate(new Date());

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      
      {/* LEFT SECTION: Hamburger, Dynamic Icon, Branding */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center gap-2">
          {/* Creative Dynamic Date Icon */}
          <div className="flex flex-col items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm bg-white">
            <div className="bg-blue-600 w-full h-2.5"></div>
            <div className="text-sm font-bold text-gray-700 w-full text-center leading-tight">
              {todayDayNumber}
            </div>
          </div>
          <span className="text-xl font-normal text-gray-600 dark:text-gray-200">CalVolt</span>
        </div>
      </div>

      {/* CENTER SECTION: Today, Left Arrow, Date, Right Arrow */}
      {/* <div className="flex items-center gap-4 flex-1 ml-8"> */}
        <button 
          onClick={goToToday}
          className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 shadow-sm"
        >
          Today
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h2 className="text-xl font-normal text-gray-700 dark:text-gray-200 min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>

          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      {/* </div> */}

      {/* RIGHT SECTION: Search, Support, View Switcher, Avatar */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* View Switcher Dropdown */}
        <div className="ml-2 mr-2 rounded-md">
          <Select
            value={currentView || "month"}
            onValueChange={(value) => setCurrentView(value)}
            >
            <SelectTrigger className="w-[140px] px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 shadow-sm">
                <SelectValue placeholder="Select view" />
            </SelectTrigger>

            <SelectContent className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 shadow-sm">
                <SelectGroup>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>
        </div>

        {/* User Avatar Placeholder */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all shadow-sm">
          <User className="w-5 h-5" />
        </div>
      </div>

    </header>
  );
}