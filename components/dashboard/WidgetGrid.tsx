'use client';

import { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Settings, Trash2, Maximize2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface Widget {
  id: string;
  type: 'email' | 'calendar' | 'tasks' | 'chat' | 'analytics' | 'custom';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
}

interface WidgetGridProps {
  agentId: string;
  initialWidgets?: Widget[];
  onLayoutChange?: (widgets: Widget[]) => void;
  onAddWidget?: () => void;
  onRemoveWidget?: (widgetId: string) => void;
}

export default function WidgetGrid({
  agentId,
  initialWidgets = [],
  onLayoutChange,
  onAddWidget,
  onRemoveWidget,
}: WidgetGridProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);

  const layouts = {
    lg: widgets.map(w => ({
      i: w.id,
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h,
      minW: 2,
      minH: 2,
    })),
  };

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      const updatedWidgets = widgets.map(widget => {
        const layoutItem = layout.find(l => l.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return widget;
      });

      setWidgets(updatedWidgets);
      onLayoutChange?.(updatedWidgets);
    },
    [widgets, onLayoutChange]
  );

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    onRemoveWidget?.(widgetId);
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isEditMode ? 'Done Editing' : 'Edit Layout'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddWidget}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </motion.button>
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        resizeHandles={['se']}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="relative">
            <WidgetContainer
              widget={widget}
              isEditMode={isEditMode}
              onRemove={() => handleRemoveWidget(widget.id)}
            />
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {widgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
            <Plus className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Widgets Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Add your first widget to customize your dashboard
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddWidget}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold"
          >
            Add Widget
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function WidgetContainer({
  widget,
  isEditMode,
  onRemove,
}: {
  widget: Widget;
  isEditMode: boolean;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      className={`h-full bg-white dark:bg-slate-900 rounded-xl border-2 overflow-hidden transition-all ${
        isEditMode
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Widget Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <div className="drag-handle cursor-move">
              <GripVertical className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <h3 className="font-semibold text-sm">{widget.title}</h3>
        </div>

        <div className="flex items-center gap-1">
          {isEditMode ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4 h-[calc(100%-56px)] overflow-auto">
        <WidgetContent widget={widget} />
      </div>
    </motion.div>
  );
}

function WidgetContent({ widget }: { widget: Widget }) {
  // Dynamically render widget based on type
  switch (widget.type) {
    case 'email':
      return <EmailWidget />;
    case 'calendar':
      return <CalendarWidget />;
    case 'tasks':
      return <TasksWidget />;
    case 'chat':
      return <ChatWidget />;
    case 'analytics':
      return <AnalyticsWidget />;
    default:
      return <CustomWidget />;
  }
}

// Widget Components (Placeholders - will be implemented next)
function EmailWidget() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">Email Subject {i}</h4>
            <span className="text-xs text-slate-500">2h ago</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            Preview of email content goes here...
          </p>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget() {
  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold">26</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">October 2025</p>
      </div>
      {[1, 2].map(i => (
        <div
          key={i}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">Meeting {i}</h4>
            <span className="text-xs text-slate-500">3:00 PM</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Team sync meeting
          </p>
        </div>
      ))}
    </div>
  );
}

function TasksWidget() {
  return (
    <div className="space-y-2">
      {[
        { task: 'Review pull requests', done: false },
        { task: 'Update documentation', done: true },
        { task: 'Team meeting at 3pm', done: false },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={item.done}
            className="w-4 h-4 rounded border-slate-300"
            readOnly
          />
          <span
            className={`text-sm ${
              item.done
                ? 'line-through text-slate-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {item.task}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChatWidget() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-auto mb-3">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex-shrink-0" />
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-sm">
            How can I help you today?
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
      />
    </div>
  );
}

function AnalyticsWidget() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">47</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Tasks</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">98%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Success</div>
        </div>
      </div>
    </div>
  );
}

function CustomWidget() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <p className="text-sm">Custom Widget</p>
    </div>
  );
}
