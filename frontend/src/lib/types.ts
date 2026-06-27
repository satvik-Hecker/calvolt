export interface CalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  color: string;     // hex color e.g. '#4285f4'
  isAllDay: boolean;
  reminders: number[];
  repeat: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OverlapWarning {
  message: string;
  conflictingEvent: {
    _id: string;
    title: string;
    startTime: string;
    endTime: string;
  };
}

export interface EventApiResponse {
  requiresConfirmation?: boolean;
  overlapWarning?: OverlapWarning;
}

export type CreateEventPayload = Omit<CalendarEvent, '_id' | 'userId' | 'createdAt' | 'updatedAt'> & {
  forceCreate?: boolean;
};

export type UpdateEventPayload = Partial<CreateEventPayload> & {
  forceUpdate?: boolean;
};
