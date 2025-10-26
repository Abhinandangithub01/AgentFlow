'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Star, Archive, Trash2, Reply, Clock, Loader2 } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'high' | 'normal' | 'low';
}

export default function EmailWidget({ agentId }: { agentId: string }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  useEffect(() => {
    loadEmails();
  }, [agentId, filter]);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockEmails: Email[] = [
        {
          id: '1',
          from: 'john@acme.com',
          subject: 'Q4 Project Update',
          preview: 'Hi team, here is the latest update on our Q4 initiatives...',
          timestamp: '2 hours ago',
          isRead: false,
          isStarred: true,
          priority: 'high',
        },
        {
          id: '2',
          from: 'sarah@company.com',
          subject: 'Meeting Notes',
          preview: 'Attached are the notes from today\'s meeting...',
          timestamp: '5 hours ago',
          isRead: true,
          isStarred: false,
          priority: 'normal',
        },
        {
          id: '3',
          from: 'notifications@github.com',
          subject: 'New PR Review Request',
          preview: 'You have been requested to review a pull request...',
          timestamp: '1 day ago',
          isRead: false,
          isStarred: false,
          priority: 'normal',
        },
      ];

      setTimeout(() => {
        setEmails(mockEmails);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading emails:', error);
      setIsLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread') return !email.isRead;
    if (filter === 'starred') return email.isStarred;
    return true;
  });

  const unreadCount = emails.filter(e => !e.isRead).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Inbox</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'unread', 'starred'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Mail className="w-12 h-12 mb-2" />
            <p className="text-sm">No emails</p>
          </div>
        ) : (
          filteredEmails.map((email, index) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                email.isRead
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 shadow-sm'
              } hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {email.priority === 'high' && (
                      <span className="text-red-500 text-xs">🔴</span>
                    )}
                    <h4 className={`text-sm truncate ${
                      email.isRead ? 'font-normal' : 'font-semibold'
                    }`}>
                      {email.subject}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {email.from}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle star
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        email.isStarred
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-400 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                {email.preview}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {email.timestamp}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <Reply className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <Archive className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
          View All Emails
        </button>
      </div>
    </div>
  );
}
