'use client';

import { useCalendar } from '@/store/CalendarContext';
import { useAuth } from '@/store/AuthContext';
import { format } from 'date-fns';
import { X, Pencil, Trash2, Clock, MapPin, CalendarDays } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import API_BASE_URL from '@/lib/apiConfig';

export default function EventDetailPopover() {
  const {
    detailEvent,
    setDetailEvent,
    detailPosition,
    setDetailPosition,
    setEditingEvent,
    setIsModalOpen,
    fetchEvents,
  } = useCalendar();
  const { token } = useAuth();

  const popoverRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Adjust position to stay in viewport
  const [adjustedPos, setAdjustedPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!detailPosition || !popoverRef.current) {
      setAdjustedPos(null);
      return;
    }

    const popover = popoverRef.current;
    const rect = popover.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = detailPosition.x - rect.width / 2;
    let top = detailPosition.y + 8;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + rect.width > viewportW - 8) left = viewportW - rect.width - 8;
    if (top + rect.height > viewportH - 8) top = detailPosition.y - rect.height - 8;
    if (top < 8) top = 8;

    setAdjustedPos({ top, left });
  }, [detailPosition, detailEvent]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (detailEvent) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [detailEvent]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!detailEvent || !detailPosition) return null;

  const handleClose = () => {
    setDetailEvent(null);
    setDetailPosition(null);
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setEditingEvent(detailEvent);
    setIsModalOpen(true);
    handleClose();
  };

  const handleDelete = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${detailEvent._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchEvents();
        handleClose();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const start = new Date(detailEvent.startTime);
  const end = new Date(detailEvent.endTime);

  return (
    <div className="fixed inset-0 z-40" onClick={handleClose}>
      <div
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 max-w-[90vw] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: adjustedPos?.top ?? detailPosition.y,
          left: adjustedPos?.left ?? detailPosition.x,
        }}
      >
        {/* Color bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: detailEvent.color || '#4285f4' }}
        />

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 pr-2 leading-tight">
              {detailEvent.title}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {detailEvent.isAllDay
                ? format(start, 'EEEE, MMMM d, yyyy') + ' (All day)'
                : `${format(start, 'EEE, MMM d')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`}
            </span>
          </div>

          {/* Location */}
          {detailEvent.location && (
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {detailEvent.location}
              </span>
            </div>
          )}

          {/* Recurrence */}
          {detailEvent.repeat?.frequency !== 'none' && (
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Repeats {detailEvent.repeat.frequency}
              </span>
            </div>
          )}

          {/* Description */}
          {detailEvent.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
              {detailEvent.description}
            </p>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                Delete this event?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2.5 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
