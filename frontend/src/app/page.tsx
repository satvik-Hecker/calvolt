import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          {/* The Calendar Grid will go here shortly */}
          <div className="h-full w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400">
            Monthly Grid View Goes Here
          </div>
        </main>
      </div>
    </div>
  );
}