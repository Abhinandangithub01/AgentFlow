'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Video, MapPin, Users, Loader2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendees?: number;
  type: 'meeting' | 'call' | 'event';
  color: string;
}

export default function CalendarWidget({ agentId }: { agentId: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  useEffect(() => {
    loadEvents();
  }, [agentId, currentDate, view]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Standup',
          start: '09:00',
          end: '09:30',
          attendees: 8,
          type: 'meeting',
          color: 'blue',
        },
        {
          id: '2',
          title: 'Client Call',
          start: '11:00',
          end: '12:00',
          location: 'Zoom',
          attendees: 3,
          type: 'call',
          color: 'green',
        },
        {
          id: '3',
          title: 'Project Review',
          start: '14:00',
          end: '15:30',
          location: 'Conference Room A',
          attendees: 12,
          type: 'meeting',
          color: 'purple',
        },
        {
          id: '4',
          title: 'Design Workshop',
          start: '16:00',
          end: '17:00',
          type: 'event',
          color: 'orange',
        },
      ];

      setTimeout(() => {
        setEvents(mockEvents);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading events:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-500',
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500',
    orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-500',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Calendar</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'day' ? 'week' : 'day')}
            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {view === 'day' ? 'Week' : 'Day'}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDate('prev')}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="font-semibold">{formatDate(currentDate)}</div>
          <div className="text-xs text-slate-500">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={() => navigateDate('next')}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Calendar className="w-12 h-12 mb-2" />
            <p className="text-sm">No events today</p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border-l-4 ${colorClasses[event.color as keyof typeof colorClasses]} hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{event.start} - {event.end}</span>
                  </div>
                </div>

                {event.type === 'call' && (
                  <Video className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {(event.location || event.attendees) && (
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.attendees && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Join
                  </button>
                  <button className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>
    </div>
  );
}
