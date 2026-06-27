import { Plus } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 border-r border-gray-200 dark:border-gray-800 hidden md:block h-[calc(100vh-65px)] bg-white dark:bg-gray-900">
      <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 rounded-full hover:shadow-md transition-shadow">
        <Plus className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium pr-2 text-gray-700 dark:text-gray-300">Create</span>
      </button>
      
      <div className="mt-8">
        {/* We will drop a mini-calendar component here later */}
        <p className="text-xs font-semibold text-gray-500 uppercase">My Calendars</p>
      </div>
    </aside>
  );
}