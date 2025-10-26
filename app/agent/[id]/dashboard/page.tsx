'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  Plus,
  Settings,
  MessageSquare,
  Activity,
  Loader2,
} from 'lucide-react';
import WidgetGrid, { Widget } from '@/components/dashboard/WidgetGrid';
import ChatInterface from '@/components/chat/ChatInterface';

export default function AgentDashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<any>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    if (user && agentId) {
      loadAgentData();
    }
  }, [user, userLoading, agentId]);

  const loadAgentData = async () => {
    try {
      setIsLoading(true);

      // Load agent details
      const agentRes = await fetch(`/api/agents/${agentId}`);
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData.agent);
      }

      // Load widgets
      const widgetsRes = await fetch(`/api/agents/${agentId}/widgets`);
      if (widgetsRes.ok) {
        const widgetsData = await widgetsRes.json();
        setWidgets(widgetsData.widgets || []);
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLayoutChange = async (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);

    // Save layout to backend
    try {
      for (const widget of updatedWidgets) {
        await fetch(`/api/agents/${agentId}/widgets`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId: widget.id,
            position: widget.position,
          }),
        });
      }
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  const handleAddWidget = () => {
    setShowWidgetLibrary(true);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      await fetch(`/api/agents/${agentId}/widgets?widgetId=${widgetId}`, {
        method: 'DELETE',
      });
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  };

  const handleCreateWidget = async (type: Widget['type'], title: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          position: {
            x: 0,
            y: widgets.length * 2,
            w: 6,
            h: 4,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWidgets(prev => [...prev, data.widget]);
        setShowWidgetLibrary(false);
      }
    } catch (error) {
      console.error('Error creating widget:', error);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || !agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold">{agent.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/agent/${agentId}/settings`)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/agent/${agentId}`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Activity
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Dashboard Grid */}
          <div className={showChat ? 'col-span-8' : 'col-span-12'}>
            <WidgetGrid
              agentId={agentId}
              initialWidgets={widgets}
              onLayoutChange={handleLayoutChange}
              onAddWidget={handleAddWidget}
              onRemoveWidget={handleRemoveWidget}
            />
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="col-span-4"
            >
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
                <ChatInterface
                  agentId={agentId}
                  agentName={agent.name}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Widget Library Modal */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <WidgetLibraryModal
            onClose={() => setShowWidgetLibrary(false)}
            onSelect={handleCreateWidget}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WidgetLibraryModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (type: Widget['type'], title: string) => void;
}) {
  const widgetTypes = [
    {
      type: 'email' as const,
      title: 'Email Widget',
      description: 'View and manage emails',
      icon: '📧',
    },
    {
      type: 'calendar' as const,
      title: 'Calendar Widget',
      description: 'View upcoming events',
      icon: '📅',
    },
    {
      type: 'tasks' as const,
      title: 'Tasks Widget',
      description: 'Manage your tasks',
      icon: '✅',
    },
    {
      type: 'chat' as const,
      title: 'Chat Widget',
      description: 'Quick chat interface',
      icon: '💬',
    },
    {
      type: 'analytics' as const,
      title: 'Analytics Widget',
      description: 'Performance metrics',
      icon: '📊',
    },
    {
      type: 'custom' as const,
      title: 'Custom Widget',
      description: 'Build your own',
      icon: '🔧',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6">Add Widget</h2>

        <div className="grid grid-cols-2 gap-4">
          {widgetTypes.map((widget) => (
            <motion.button
              key={widget.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(widget.type, widget.title)}
              className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all text-left"
            >
              <div className="text-4xl mb-3">{widget.icon}</div>
              <h3 className="font-bold mb-1">{widget.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {widget.description}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
